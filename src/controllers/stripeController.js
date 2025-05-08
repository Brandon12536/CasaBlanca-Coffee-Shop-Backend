const stripe = require('../config/stripe');


exports.createPaymentIntent = async (req, res) => {
  console.log('LLEGA PETICIÓN STRIPE', req.body);
  try {
    const { amount, currency = 'mxn', user_id } = req.body;
    console.log('Datos recibidos:', { amount, currency, user_id });
    if (!amount || !user_id) {
      console.log('Faltan datos, respondiendo 400');
      return res.status(400).json({ error: 'Amount y user_id son requeridos' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency,
      metadata: { user_id },
    });
    console.log('[DEBUG PaymentIntent]', paymentIntent);
    console.log('Respondiendo con client_secret');
    return res.status(200).json({ client_secret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating PaymentIntent:', error);
    console.log('Respondiendo con error 500');
    return res.status(500).json({ error: error.message });
  }
};


exports.stripeWebhook = async (req, res) => {
  const supabase = require('../config/supabase');
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;
  try {
    const sig = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const metadata = paymentIntent.metadata || {};
    const user_id = metadata.user_id;
    const amount = paymentIntent.amount_received / 100;
    const currency = paymentIntent.currency;
    const stripe_payment_id = paymentIntent.id;
    const status = paymentIntent.status;
    // const payment_method = paymentIntent.payment_method_types ? paymentIntent.payment_method_types[0] : 'tarjeta';
    const stripeMethod = paymentIntent.payment_method_types?.[0] || "card";
    const payment_method = stripeMethod === "card" ? "tarjeta" : stripeMethod;
    const receipt_url = paymentIntent.charges?.data?.[0]?.receipt_url || null;

    let items = [];
    let shipping_address = metadata.shipping_address || "";
    try {
      if (user_id) {
        const { data: cartItems, error: cartError } = await supabase
          .from("cart")
          .select("*")
          .eq("user_id", user_id);
        if (cartError) throw cartError;
        items = (cartItems || []).map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.product_price,
        }));
      }

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            user_id,
            total: amount,
            shipping_address,
            payment_method,
            status: "completed",
          },
        ])
        .select()
        .single();
      if (orderError) throw orderError;
      const order = orderData;
      console.log("[STRIPE WEBHOOK] Orden insertada:", order);

      if (items.length > 0) {
        const orderItems = items.map((item) => ({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
        }));
        console.log(
          "[STRIPE WEBHOOK] orderItems to insert:",
          JSON.stringify(orderItems, null, 2)
        );
        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItems);
        if (itemsError) throw itemsError;
        console.log(
          "[STRIPE WEBHOOK] Items insertados en order_items:",
          orderItems
        );
      }

      const { data: paymentData, error: paymentError } = await supabase
        .from("payments")
        .insert([
          {
            order_id: order.id,
            user_id,
            stripe_payment_id,
            amount,
            currency,
            status,
            payment_method,
            receipt_url,
          },
        ])
        .select()
        .single();
      if (paymentError) throw paymentError;
      console.log("[STRIPE WEBHOOK] Pago insertado en payments:", paymentData);

      await supabase.from("cart").delete().eq("user_id", user_id);

      return res.status(200).json({ received: true });
    } catch (err) {
      console.error("Error en webhook Stripe:", err);
      return res.status(500).json({ error: err.message });
    }
  } else {

    return res.status(200).json({ received: true });
  }
};


exports.checkout = async (req, res) => {
  const supabase = require('../config/supabase');
  try {
    const {
      cart,
      shippingAddress,
      paymentMethod,
      stripePaymentId,
      amount,
      currency,
      receiptUrl,
      stripeEventData
    } = req.body;


    const userId = req.user?.id;
    /*console.log('[DEBUG][checkout] userId:', userId);
    console.log('[DEBUG][checkout] cart:', cart);
    console.log('[DEBUG][checkout] shippingAddress:', shippingAddress);
    console.log('[DEBUG][checkout] paymentMethod:', paymentMethod);
    console.log('[DEBUG][checkout] stripePaymentId:', stripePaymentId);
    console.log('[DEBUG][checkout] amount:', amount);
    console.log('[DEBUG][checkout] currency:', currency);
    console.log('[DEBUG][checkout] receiptUrl:', receiptUrl);*/

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{ user_id: userId, total: amount, shipping_address: shippingAddress, payment_method: paymentMethod, status: 'completed' }])
      .select()
      .single();
    console.log('[DEBUG][checkout] order insert result:', order, orderError);
    if (orderError) return res.status(400).json({ error: orderError.message });


    const { data: cartItems, error: cartError } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', userId);
    console.log('[DEBUG][checkout] cartItems for order_items:', cartItems, cartError);
    if (cartError) return res.status(400).json({ error: cartError.message });

    if (cartItems && cartItems.length > 0) {

      const invalidItems = cartItems.filter(item => !item.product_id);
      if (invalidItems.length > 0) {
        console.error('[DEBUG][checkout] Algunos productos del carrito no tienen product_id:', invalidItems);
      }
      const orderItems = cartItems
        .filter(item => item.product_id)
        .map(item => ({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.product_price,
        }));
      console.log('[DEBUG][checkout] orderItems to insert:', JSON.stringify(orderItems, null, 2));
      if (orderItems.length > 0) {
        const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
        console.log('[DEBUG][checkout] order_items insert result:', itemsError);
        if (itemsError) return res.status(400).json({ error: itemsError.message });
      } else {
        console.log('[DEBUG][checkout] No valid order_items to insert.');
      }
    } else {
      console.log('[DEBUG][checkout] No cartItems found for user.');
    }


    const { error: paymentError } = await supabase.from('payments').insert([
      {
        order_id: order.id,
        user_id: userId,
        stripe_payment_id: stripePaymentId,
        amount,
        currency,
        status: 'succeeded',
        payment_method: paymentMethod,
        receipt_url: receiptUrl,
        stripe_event_data: stripeEventData,
      }
    ]);
    console.log('[DEBUG][checkout] payments insert result:', paymentError);
    if (paymentError) return res.status(400).json({ error: paymentError.message });


    const { error: clearCartError } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', userId);
    console.log('[DEBUG][checkout] cart clear result:', clearCartError);
    if (clearCartError) return res.status(400).json({ error: clearCartError.message });

    res.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error('[DEBUG][checkout] error:', error);
    res.status(500).json({ error: error.message });
  }
};

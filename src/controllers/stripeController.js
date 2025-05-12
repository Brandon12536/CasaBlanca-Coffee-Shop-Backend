const stripe = require("../config/stripe");
const supabase = require("../config/supabase");

// Controlador para crear PaymentIntent
const createPaymentIntent = async (req, res) => {
  console.log("LLEGA PETICIÓN STRIPE", req.body);
  try {
    const { amount, currency = "mxn", user_id } = req.body;
    console.log("Datos recibidos:", { amount, currency, user_id });

    if (!amount || !user_id) {
      console.log("Faltan datos, respondiendo 400");
      return res.status(400).json({ error: "Amount y user_id son requeridos" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency,
      metadata: { user_id },
    });

    console.log("[DEBUG PaymentIntent]", paymentIntent);
    console.log("Respondiendo con client_secret");
    return res.status(200).json({ client_secret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating PaymentIntent:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Controlador para webhook de Stripe
const stripeWebhook = async (req, res) => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    const sig = req.headers["stripe-signature"];
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const metadata = paymentIntent.metadata || {};
    const user_id = metadata.user_id;
    const amount = paymentIntent.amount_received / 100;
    const currency = paymentIntent.currency;
    const stripe_payment_id = paymentIntent.id;
    const status = paymentIntent.status;
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
            status: "preparando",
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
  }

  return res.status(200).json({ received: true });
};

// Controlador para checkout
const checkout = async (req, res) => {
  console.log("[checkout] Datos recibidos:", req.body);

  try {
    const {
      payment_data: {
        stripe_payment_id,
        amount,
        currency,
        payment_method,
        status,
      },
      order_data: { items, shipping_address, subtotal },
    } = req.body;

    const user_id = req.user.id;

    if (!user_id) {
      return res.status(400).json({ error: "Usuario no identificado" });
    }

    // Validaciones básicas
    if (!stripe_payment_id || !amount || !items || !shipping_address) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    // Verificar el pago con Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(
      stripe_payment_id
    );
    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ error: "El pago no fue exitoso" });
    }

    // Crear la orden en Supabase
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          user_id,
          total: subtotal,
          shipping_address: JSON.stringify(shipping_address),
          payment_method,
          status: "preparando",
        },
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // Insertar items de la orden
    const { error: itemsError } = await supabase.from("order_items").insert(
      items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.unit_price,
      }))
    );

    if (itemsError) throw itemsError;

    // Registrar el pago
    const { data: payment, error: paymentError } = await supabase
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
          receipt_url: paymentIntent.charges?.data?.[0]?.receipt_url || null,
        },
      ])
      .select()
      .single();

    if (paymentError) throw paymentError;

    // Limpiar el carrito del usuario
    await supabase.from("cart").delete().eq("user_id", user_id);

    // Respuesta exitosa
    return res.status(200).json({
      success: true,
      order_id: order.id,
      payment_id: payment.id,
    });
  } catch (error) {
    console.error("[checkout] Error:", error);
    return res.status(500).json({
      error: "Error al procesar el pago",
      details: error.message,
    });
  }
};

// Exportación única de todos los controladores
module.exports = {
  createPaymentIntent,
  stripeWebhook,
  checkout,
};

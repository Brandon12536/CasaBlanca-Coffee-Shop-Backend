const stripe = require("../config/stripe");
const supabase = require("../config/supabase");
const { sendOrderConfirmation } = require("../services/emailService");
const { centsToPesos } = require("../utils/moneyUtils");

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

      // Get user details for email
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("email, name")
        .eq("id", user_id)
        .single();

      if (!userError && userData) {
        console.log('[STRIPE WEBHOOK] Datos del usuario para el correo:', {
          email: userData.email,
          name: userData.name
        });
        
        // Get order with items for the email
        const { data: orderWithItems, error: orderItemsError } = await supabase
          .from("order_items")
          .select(`
            *,
            products(name as product_name)
          `)
          .eq("order_id", order.id);
          
        console.log('[STRIPE WEBHOOK] Resultado de la consulta de items:', {
          items: orderWithItems?.length || 0,
          error: orderItemsError?.message
        });

        if (!orderItemsError && orderWithItems) {
          // Format order data for email
          const orderForEmail = {
            ...order,
            items: orderWithItems.map(item => ({
              ...item,
              product_name: item.products?.name || 'Producto sin nombre',
            }))
          };

          console.log('[STRIPE WEBHOOK] Enviando correo de confirmación...', {
            orderId: order.id,
            email: userData.email
          });

          try {
            // Send confirmation email
            const emailSent = await sendOrderConfirmation(orderForEmail, userData.email, userData.name, order.shipping_address || {});
            console.log('[STRIPE WEBHOOK] Resultado del envío de correo:', emailSent);
          } catch (emailError) {
            console.error('[STRIPE WEBHOOK] Error al enviar el correo:', emailError);
          }
        }
      }

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
  console.log('[CHECKOUT] Iniciando proceso de checkout');
  console.log("[checkout] Datos recibidos:", JSON.stringify(req.body, null, 2));

  try {
    const {
      payment_data: {
        stripe_payment_id,
        amount,
        currency = 'mxn',
        payment_method = 'card',
        status = 'succeeded',
      },
      order_data: { items, shipping_address, subtotal },
    } = req.body;

    const user_id = req.user?.id;

    if (!user_id) {
      console.error('[CHECKOUT] Error: Usuario no identificado');
      return res.status(400).json({ error: "Usuario no identificado" });
    }

    // Validaciones básicas
    if (!stripe_payment_id || !amount || !items || !shipping_address) {
      console.error('[CHECKOUT] Error: Datos incompletos', {
        stripe_payment_id: !!stripe_payment_id,
        amount: !!amount,
        items: items?.length,
        shipping_address: !!shipping_address
      });
      return res.status(400).json({ error: "Datos incompletos" });
    }

    // Verificar el pago con Stripe
    console.log('[CHECKOUT] Verificando pago con Stripe:', stripe_payment_id);
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(stripe_payment_id);
      
      if (paymentIntent.status !== "succeeded") {
        console.error('[CHECKOUT] El pago no fue exitoso. Estado:', paymentIntent.status);
        return res.status(400).json({ error: "El pago no fue exitoso" });
      }
    } catch (stripeError) {
      console.error('[CHECKOUT] Error al verificar el pago con Stripe:', stripeError);
      return res.status(400).json({ error: "Error al verificar el pago con Stripe" });
    }

    console.log('[CHECKOUT] Creando orden en Supabase');
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

    if (orderError) {
      console.error('[CHECKOUT] Error al crear la orden:', orderError);
      throw orderError;
    }
    
    console.log('[CHECKOUT] Orden creada:', order.id);
    
    // Insertar items de la orden
    console.log('[CHECKOUT] Insertando items de la orden:', items.length);
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price || item.unit_price
    }));
    
    console.log('[CHECKOUT] Items a insertar:', JSON.stringify(orderItems, null, 2));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error('[CHECKOUT] Error al insertar items:', itemsError);
      throw itemsError;
    }
    
    // Obtener el usuario para el correo
    console.log('[CHECKOUT] Obteniendo datos del usuario para el correo');
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("email, name")
      .eq("id", user_id)
      .single();

    if (!userError && userData) {
      console.log('[CHECKOUT] Enviando correo de confirmación a:', userData.email);
      try {
        // Obtener detalles completos de los productos
        const productIds = items.map(item => item.product_id);
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('id, name, price')
          .in('id', productIds);
        
        if (productsError) throw productsError;
        
        // Crear un mapa de productos para búsqueda rápida
        const productsMap = products.reduce((acc, product) => ({
          ...acc,
          [product.id]: product
        }), {});
        
        // Crear orden con información completa para el PDF
        const orderForEmail = {
          ...order,
          items: items.map(item => {
            const product = productsMap[item.product_id] || {};
            return {
              ...item,
              product_name: product.name || 'Producto sin nombre',
              price: item.price || item.unit_price || 0
            };
          })
        };
        
        console.log('[CHECKOUT] Enviando correo con orden:', JSON.stringify(orderForEmail, null, 2));
        await sendOrderConfirmation(orderForEmail, userData.email, userData.name, req.body.order_data?.shipping_address || {});
        console.log('[CHECKOUT] Correo de confirmación enviado exitosamente');
      } catch (emailError) {
        console.error('[CHECKOUT] Error al enviar el correo:', emailError);
        // No fallar la operación si falla el correo
      }
    } else {
      console.error('[CHECKOUT] No se pudo obtener la información del usuario:', userError);
    }
    
    // Registrar el pago
    console.log('[CHECKOUT] Registrando pago en la base de datos');
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
          receipt_url: null, // Se actualizará cuando se reciba el webhook
        },
      ])
      .select()
      .single();

    if (paymentError) {
      console.error('[CHECKOUT] Error al registrar el pago:', paymentError);
      throw paymentError;
    }

    // Limpiar el carrito del usuario
    console.log('[CHECKOUT] Limpiando carrito del usuario');
    await supabase.from("cart").delete().eq("user_id", user_id);

    // Respuesta exitosa
    console.log('[CHECKOUT] Checkout completado exitosamente');
    return res.status(200).json({
      success: true,
      order_id: order.id,
      payment_id: payment.id
    });
  } catch (error) {
    console.error("[CHECKOUT] Error:", error);
    return res.status(500).json({
      error: "Error al procesar el pago",
      details: error.message
    });
  }
};

// Exportación única de todos los controladores
module.exports = {
  createPaymentIntent,
  stripeWebhook,
  checkout,
};

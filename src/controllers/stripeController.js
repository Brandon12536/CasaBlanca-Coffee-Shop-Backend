// src/controllers/stripeController.js
const stripe = require("../config/stripe");
const supabase = require("../config/supabase");
const { ORDER_STATUS, PAYMENT_METHODS } = require("../constants/orderStatuses");
const { sendOrderConfirmation } = require("../services/emailService");

// Helper para manejo de errores
const handleError = (context, error, res) => {
  console.error(`[${context}] Error:`, error);
  return res.status(500).json({
    success: false,
    message: `Error en ${context}`,
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
};

// Controlador para crear PaymentIntent
const createPaymentIntent = async (req, res) => {
  try {
    console.log("[createPaymentIntent] Datos recibidos:", req.body);

    const { amount, currency = "mxn", user_id } = req.body;

    if (!amount || !user_id) {
      return res.status(400).json({
        success: false,
        message: "Amount y user_id son requeridos",
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency,
      metadata: { user_id },
      payment_method_types: ["card"],
    });

    console.log("[PaymentIntent Creado]", {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      status: paymentIntent.status,
    });

    return res.status(200).json({
      success: true,
      client_secret: paymentIntent.client_secret,
    });
  } catch (error) {
    return handleError("createPaymentIntent", error, res);
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
    console.error("Error en verificación de webhook:", err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    try {
      const paymentIntent = event.data.object;
      const { metadata, amount_received, currency, id } = paymentIntent;
      const user_id = metadata?.user_id;

      console.log("[Webhook] PaymentIntent exitoso:", {
        paymentIntentId: id,
        userId: user_id,
        amount: amount_received,
      });

      // 1. Obtener items del carrito
      const { data: cartItems = [], error: cartError } = user_id
        ? await supabase.from("cart").select("*").eq("user_id", user_id)
        : { data: [] };

      if (cartError) throw cartError;

      const items = cartItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product_price,
      }));

      // 2. Crear la orden
      const orderData = {
        user_id,
        total: amount_received / 100,
        shipping_address: metadata.shipping_address || null,
        payment_method: PAYMENT_METHODS.CARD,
        status: ORDER_STATUS.PROCESSING,
      };

      console.log("[Webhook] Creando orden:", orderData);
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([orderData])
        .select()
        .single();

      if (orderError) throw orderError;

      // 3. Crear items de la orden
      if (items.length > 0) {
        const orderItems = items.map((item) => ({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
        }));

        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItems);

        if (itemsError) throw itemsError;
      }

      // 4. Registrar el pago
      const paymentData = {
        order_id: order.id,
        user_id,
        stripe_payment_id: id,
        amount: amount_received,
        currency,
        status: paymentIntent.status,
        payment_method: PAYMENT_METHODS.CARD,
        receipt_url: paymentIntent.charges?.data?.[0]?.receipt_url || null,
      };

      const { error: paymentError } = await supabase
        .from("payments")
        .insert([paymentData]);

      if (paymentError) throw paymentError;

      // 5. Limpiar carrito si existe user_id
      if (user_id) {
        await supabase.from("cart").delete().eq("user_id", user_id);
      }

      // 6. Enviar correo de confirmación con PDF
      try {
        // Obtener información del usuario
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("email, name")
          .eq("id", user_id)
          .single();

        if (userError) {
          console.error("[Webhook] Error al obtener datos del usuario para el correo:", userError);
        } else if (userData && userData.email) {
          // Obtener items de la orden
          const { data: orderItems, error: orderItemsError } = await supabase
            .from("order_items")
            .select("product_id, quantity, price")
            .eq("order_id", order.id);

          if (orderItemsError) {
            console.error("[Webhook] Error al obtener items de la orden:", orderItemsError);
          } else {
            // Obtener nombres de productos
            const productIds = orderItems.map(item => item.product_id);
            const { data: products, error: productsError } = await supabase
              .from("products")
              .select("id, name")
              .in("id", productIds);

            if (productsError) {
              console.error("[Webhook] Error al obtener productos:", productsError);
            } else {
              // Preparar datos para el correo
              const orderWithItems = {
                ...order,
                items: orderItems.map(item => {
                  const product = products.find(p => p.id === item.product_id);
                  return {
                    product_name: product ? product.name : `Producto ${item.product_id}`,
                    quantity: item.quantity,
                    price: item.price
                  };
                })
              };

              const userName = userData.name || 'Cliente';

              // Parsear la dirección de envío si está en formato JSON
              let shippingAddress = order.shipping_address;
              if (typeof shippingAddress === 'string') {
                try {
                  shippingAddress = JSON.parse(shippingAddress);
                } catch (e) {
                  console.error("[Webhook] Error al parsear dirección de envío:", e);
                  // Usar un objeto vacío si no se puede parsear
                  shippingAddress = {};
                }
              }

              // Enviar correo de confirmación con PDF
              console.log("[Webhook] Enviando correo de confirmación a", userData.email);
              await sendOrderConfirmation(
                orderWithItems,
                userData.email,
                userName,
                shippingAddress
              );
            }
          }
        }
      } catch (emailError) {
        console.error("[Webhook] Error al enviar correo de confirmación:", emailError);
        // No fallamos la respuesta si el correo falla
      }

      return res.status(200).json({ received: true });
    } catch (error) {
      console.error("[Webhook Error]", error);
      return res.status(500).json({ received: false });
    }
  }

  return res.status(200).json({ received: true });
};

// Controlador para checkout
const checkout = async (req, res) => {
  try {
    console.log("[checkout] Iniciando proceso con datos:", req.body);

    // Validar autenticación
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
    }

    // Extraer datos
    const { payment_data, order_data } = req.body;
    const { stripe_payment_id, amount, currency, payment_method } =
      payment_data;

    const { items, shipping_address, subtotal } = order_data;

    // Validaciones básicas
    if (!stripe_payment_id || !amount || !items || !shipping_address) {
      return res.status(400).json({
        success: false,
        message: "Datos incompletos para el checkout",
      });
    }

    // Verificar el pago con Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(
      stripe_payment_id
    );
    if (paymentIntent.status !== "succeeded") {
      return res.status(402).json({
        success: false,
        message: "El pago no fue exitoso",
      });
    }

    // Preparar datos de la orden
    const orderData = {
      user_id: req.user.id,
      total: subtotal,
      shipping_address: JSON.stringify(shipping_address),
      payment_method: PAYMENT_METHODS.CARD,
      status: ORDER_STATUS.PROCESSING,
      created_at: new Date().toISOString(),
    };

    console.log("[checkout] Insertando orden:", orderData);

    // Insertar orden
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([orderData])
      .select()
      .single();

    if (orderError) {
      console.error("Error al crear orden:", {
        message: orderError.message,
        details: orderError.details,
        code: orderError.code,
      });
      throw orderError;
    }

    // Insertar items de la orden
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.unit_price,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Registrar el pago
    const paymentRecord = {
      order_id: order.id,
      user_id: req.user.id,
      stripe_payment_id,
      amount: amount ,
      currency,
      status: paymentIntent.status,
      payment_method: PAYMENT_METHODS.CARD,
      receipt_url: paymentIntent.charges?.data?.[0]?.receipt_url || null,
    };

    const { error: paymentError } = await supabase
      .from("payments")
      .insert([paymentRecord]);

    if (paymentError) throw paymentError;

    // Limpiar carrito
    await supabase.from("cart").delete().eq("user_id", req.user.id);

    console.log("[checkout] Proceso completado exitosamente");

    // Obtener información del usuario para el correo
    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("email, name")
        .eq("id", req.user.id)
        .single();

      if (userError) {
        console.error("Error al obtener datos del usuario para el correo:", userError);
      } else if (userData && userData.email) {
        // Preparar datos para el correo
        const orderWithItems = {
          ...order,
          items: items.map(item => ({
            product_name: item.product_name || item.name,
            quantity: item.quantity,
            price: item.unit_price
          }))
        };

        const userName = userData.name || 'Cliente';

        // Enviar correo de confirmación con PDF
        console.log("[checkout] Enviando correo de confirmación a", userData.email);
        await sendOrderConfirmation(
          orderWithItems,
          userData.email,
          userName,
          shipping_address
        );
      }
    } catch (emailError) {
      console.error("Error al enviar correo de confirmación:", emailError);
      // No fallamos la respuesta si el correo falla
    }

    return res.status(200).json({
      success: true,
      order_id: order.id,
      payment_id: paymentIntent.id,
    });
  } catch (error) {
    console.error("[checkout] Error completo:", {
      message: error.message,
      stack: error.stack,
    });
    return handleError("checkout", error, res);
  }
};

module.exports = {
  createPaymentIntent,
  stripeWebhook,
  checkout,
};

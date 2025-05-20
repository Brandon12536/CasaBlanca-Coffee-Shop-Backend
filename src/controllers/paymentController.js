const stripe = require('../config/stripe');
const supabase = require('../config/supabase');

/**
 * Crea un pago y una orden en la base de datos.
 * 
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
exports.createPaymentAndOrder = async (req, res) => {
  const {
    user_id,
    total,
    shipping_address,
    payment_method,
    status = 'pending',
    items = [],
    stripe_payment_id,
    amount,
    currency = 'mxn',
    receipt_url
  } = req.body;
  const totalInt = parseInt(total, 10);
  const amountInt = parseInt(amount, 10);

  const client = supabase;
  let order, payment;

  try {
   
    const { data: orderData, error: orderError } = await client
      .from('orders')
      .insert([
        {
          user_id,
          total,
          shipping_address,
          payment_method,
          status
        }
      ])
      .select()
      .single();
    if (orderError) throw orderError;
    order = orderData;

   
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price
    }));
    const { error: itemsError } = await client
      .from('order_items')
      .insert(orderItems);
    if (itemsError) throw itemsError;

    
    const { data: paymentData, error: paymentError } = await client
      .from('payments')
      .insert([
        {
          order_id: order.id,
          user_id,
          stripe_payment_id,
          amount,
          currency,
          status,
          payment_method,
          receipt_url
        }
      ])
      .select()
      .single();
    if (paymentError) throw paymentError;
    payment = paymentData;

    // Limpiar carrito temporal del usuario tras pago exitoso
    try {
      if (user_id) {
        await client
          .from('cart_temp')
          .delete()
          .eq('user_id', user_id);
      }
    } catch (cartClearError) {
      console.error('Error limpiando carrito:', cartClearError.message);
      // No detenemos el flujo si falla limpiar el carrito
    }

    // Marcar la orden como 'completed' si el pago fue exitoso
    if (payment.status === 'succeeded' || status === 'succeeded' || status === 'completed') {
      await client
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', order.id);
    }

    return res.status(201).json({ success: true, order, payment });
  } catch (err) {
    console.error('Error al registrar pago y orden:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

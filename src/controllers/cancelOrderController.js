const supabase = require('../config/supabase');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);


exports.cancelOrder = async (req, res) => {
  const { order_id, payment_id, user_id, cancellation_reason } = req.body;
  try {
    // 1. Buscar el pago relacionado
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('id_payments', payment_id)
      .eq('order_id', order_id)
      .eq('user_id', user_id)
      .single();
    if (paymentError || !payment) throw new Error('No se encontró el pago relacionado');

    // 2. Validar status de payment
    if (payment.status === 'Cancelado') {
      return res.status(200).json({ message: 'El pago ya estaba cancelado por el cliente' });
    }

    let refundResult = null;
    if (payment.status === 'succeeded' || payment.status === 'paid') {
    
      refundResult = await stripe.refunds.create({
        payment_intent: payment.stripe_payment_id,
        amount: payment.amount, 
      });
      // Actualizar el pago en la base de datos
      await supabase
        .from('payments')
        .update({
          status: 'Cancelado',
          cancellation_reason,
          canceled_at: new Date().toISOString(),
          refund_id: refundResult ? refundResult.id : null,
          refund_amount: refundResult ? refundResult.amount / 100 : null,
          refund_status: refundResult ? refundResult.status : null
        })
        .eq('id_payments', payment.id_payments);
    } else {
      return res.status(400).json({ error: 'El pago no está en un estado reembolsable.' });
    }

    // 3. Actualizar el estado del pedido SOLO si el pago fue reembolsado
    const { data: updatedOrder, error: orderUpdateError } = await supabase
      .from('orders')
      .update({ status: 'Cancelado', canceled_at: new Date().toISOString() })
      .eq('id', order_id);
    if (orderUpdateError) throw new Error('No se pudo actualizar el pedido');
    if (!updatedOrder || updatedOrder.length === 0) {
      // Consulta el pedido para ver si ya está cancelado
      const { data: orderCheck } = await supabase
        .from('orders')
        .select('status')
        .eq('id', order_id)
        .single();
      if (orderCheck && orderCheck.status === 'Cancelado') {
        return res.status(200).json({ message: 'Pedido cancelado y reembolso procesado correctamente' });
      }
      return res.status(404).json({ error: 'No se encontró el pedido para actualizar' });
    }

    res.json({ message: 'Pedido cancelado y reembolso procesado correctamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const orderService = require('../services/orderService');


exports.createOrder = async (req, res) => {
  try {
    const { items, total, shipping_address, payment_method } = req.body;
    

    if (!items || !total || !shipping_address || !payment_method) {
      return res.status(400).json({ message: 'Por favor, proporcione todos los campos requeridos' });
    }

    const order = await orderService.createOrder({
      user_id: req.user.id,
      items,
      total,
      shipping_address,
      payment_method,
      status: 'pending'
    });
    
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear la orden', error: error.message });
  }
};


exports.getAllOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllOrders();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener órdenes', error: error.message });
  }
};


exports.getUserOrders = async (req, res) => {
  try {
    const orders = await orderService.getUserOrders(req.user.id);
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener órdenes del usuario', error: error.message });
  }
};


exports.getOrderById = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    
   
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado' });
    }
    
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la orden', error: error.message });
  }
};


exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Por favor, proporcione el estado de la orden' });
    }
    
    const updatedOrder = await orderService.updateOrderStatus(req.params.id, status);
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar el estado de la orden', error: error.message });
  }
};

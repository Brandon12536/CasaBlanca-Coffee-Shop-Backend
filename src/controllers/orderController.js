const orderService = require("../services/orderService");
const { pesosToCents, centsToPesos } = require("../utils/moneyUtils");

exports.createOrder = async (req, res) => {
  try {
    const { items, total, ...rest } = req.body;

    // Validación y conversión SOLO al crear la orden
    const orderData = {
      ...rest,
      user_id: req.user.id,
      status: "pending",
      total: pesosToCents(total),
      items: items.map((item) => ({
        ...item,
        price: pesosToCents(item.price),
      })),
    };

    const order = await orderService.createOrder(orderData);
    res.status(201).json(order); // Devuelve los datos directos de la BD
  } catch (error) {
    res.status(400).json({
      message: "Error al crear la orden",
      error: error.message,
    });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllOrders();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener órdenes",
      error: error.message,
    });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await orderService.getUserOrdersWithProducts(req.user.id);
    res.status(200).json(orders); // Datos directos sin modificar
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener órdenes",
      error: error.message,
    });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id);

    // Solo el dueño o admin puede ver
    if (order.user_id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "No autorizado" });
    }

    res.status(200).json({
      ...order,
      total: centsToPesos(order.total),
      items: order.items.map((item) => ({
        ...item,
        price: centsToPesos(item.price),
        product: {
          ...item.product,
          price: centsToPesos(item.product.price),
        },
      })),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener la orden",
      error: error.message,
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        message: "Por favor, proporcione el estado de la orden",
      });
    }

    const updatedOrder = await orderService.updateOrderStatus(
      req.params.id,
      status
    );

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(400).json({
      message: "Error al actualizar el estado de la orden",
      error: error.message,
    });
  }
};

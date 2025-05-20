const supabase = require("../config/supabase");
const { pesosToCents, centsToPesos } = require("../utils/moneyUtils");

const ORDERS_TABLE = "orders";
const ORDER_ITEMS_TABLE = "order_items";
const PRODUCTS_TABLE = "products";

const createOrder = async (orderData) => {
  const { data: order, error: orderError } = await supabase
    .from(ORDERS_TABLE)
    .insert([orderData])
    .select();

  if (orderError) throw orderError;

  if (orderData.items && orderData.items.length > 0) {
    // LOG: Mostrar los IDs de producto que se intentan insertar
    console.log("Intentando insertar order_items con product_id:", orderData.items.map(i => i.product_id));

    const { error: itemsError } = await supabase.from(ORDER_ITEMS_TABLE).insert(
      orderData.items.map((item) => ({
        order_id: order[0].id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price, // Ya viene en centavos del controller
      }))
    );

    if (itemsError) {
      // LOG: Mostrar el error exacto de Supabase
      console.error("Error al insertar order_items:", itemsError);
      throw itemsError;
    }
  }

  return getOrderById(order[0].id);
};

const getAllOrders = async () => {
  const { data, error } = await supabase.from(ORDERS_TABLE).select("*");

  if (error) throw error;

  return data.map((order) => ({
    ...order,
    total: centsToPesos(order.total),
    items: order.items?.map((item) => ({
      ...item,
      price: centsToPesos(item.price),
      product: {
        ...item.product,
        price: centsToPesos(item.product?.price),
      },
    })),
  }));
};

// Todos los métodos de consulta DEVUELVEN LOS DATOS DIRECTOS
const getUserOrdersWithProducts = async (userId) => {
  const { data: orders, error } = await supabase
    .from(ORDERS_TABLE)
    .select(`
      *,
      items:${ORDER_ITEMS_TABLE}(
        *,
        product:${PRODUCTS_TABLE}(*)
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return orders || [];
};

const getUserOrders = async (userId) => {
  return getUserOrdersWithProducts(userId);
};

// Eliminar todas las conversiones en los demás métodos
const getOrderById = async (orderId) => {
  const { data: order, error } = await supabase
    .from(ORDERS_TABLE)
    .select(`
      *,
      items:${ORDER_ITEMS_TABLE}(
        *,
        product:${PRODUCTS_TABLE}(*)
      )
    `)
    .eq("id", orderId)
    .single();

  if (error) throw error;
  return order;
};

const updateOrderStatus = async (orderId, status) => {
  const { data, error } = await supabase
    .from(ORDERS_TABLE)
    .update({ status })
    .eq("id", orderId)
    .select();

  if (error) throw error;

  return {
    ...data[0],
    total: centsToPesos(data[0].total),
  };
};

module.exports = {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getUserOrdersWithProducts,
};

const supabase = require('../config/supabase');

const TABLE_NAME = 'orders';
const ITEMS_TABLE = 'order_items';


const createOrder = async (orderData) => {

  const { items, ...orderDetails } = orderData;
  

  const { data: order, error: orderError } = await supabase
    .from(TABLE_NAME)
    .insert([orderDetails])
    .select();
  
  if (orderError) throw orderError;
  

  if (items && items.length > 0) {
    const orderItems = items.map(item => ({
      order_id: order[0].id,
      product_id: item.product_id,
      quantity: parseInt(item.quantity, 10),
      price: parseInt(item.price, 10)
    }));
    
    const { error: itemsError } = await supabase
      .from(ITEMS_TABLE)
      .insert(orderItems);
    
    if (itemsError) throw itemsError;
  }
  

  return getOrderById(order[0].id);
};


const getAllOrders = async () => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*');
  
  if (error) throw error;
  return data;
};


const getUserOrders = async (userId) => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('user_id', userId);
  
  if (error) throw error;
  return data;
};


const getOrderById = async (orderId) => {

  const { data: order, error: orderError } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', orderId)
    .single();
  
  if (orderError) throw orderError;
  
 
  const { data: items, error: itemsError } = await supabase
    .from(ITEMS_TABLE)
    .select('*')
    .eq('order_id', orderId);
  
  if (itemsError) throw itemsError;
  
  
  return {
    ...order,
    items
  };
};


const updateOrderStatus = async (orderId, status) => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({ status })
    .eq('id', orderId)
    .select();
  
  if (error) throw error;
  return data[0];
};

module.exports = {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus
};

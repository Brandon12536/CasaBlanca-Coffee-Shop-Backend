const supabase = require('../config/supabase');

exports.addToCartTemp = async (req, res) => {
  try {
    const { session_id, product_id, product_name, product_image, product_price, quantity } = req.body;
    if (!session_id || !product_id || !product_name || !product_price) {
      return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

   
    const { data: existing, error: findError } = await supabase
      .from('cart_temp')
      .select('*')
      .eq('session_id', session_id)
      .eq('product_id', product_id)
      .single();

    if (existing) {
  
      await supabase
        .from('cart_temp')
        .update({ quantity: existing.quantity + quantity })
        .eq('id_cart_temp', existing.id_cart_temp);
    } else {

      await supabase
        .from('cart_temp')
        .insert([{ session_id, product_id, product_name, product_image, product_price, quantity }]);
    }

    const { count } = await supabase
      .from('cart_temp')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', session_id);

    res.status(200).json({ success: true, cartCount: count });
  } catch (error) {
    res.status(500).json({ message: 'Error al agregar al carrito', error: error.message });
  }
};


exports.getCartTempCount = async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ cartCount: 0 });
    const { count } = await supabase
      .from('cart_temp')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', session_id);
    res.json({ cartCount: count || 0 });
  } catch {
    res.json({ cartCount: 0 });
  }
};


exports.deleteFromCartTemp = async (req, res) => {
  try {
    const { session_id, id_cart_temp } = req.body;
    if (!session_id || !id_cart_temp) {
      return res.status(400).json({ message: 'session_id y id_cart_temp requeridos' });
    }
    const { error } = await supabase
      .from('cart_temp')
      .delete()
      .eq('session_id', session_id)
      .eq('id_cart_temp', id_cart_temp);
    if (error) {
      return res.status(500).json({ message: 'Error eliminando del carrito', error });
    }
    res.status(200).json({ message: 'Producto eliminado del carrito' });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando del carrito', error: error.message });
  }
};


exports.updateCartTempQty = async (req, res) => {
  try {
    const { session_id, id_cart_temp, quantity } = req.body;
    if (!session_id || !id_cart_temp || typeof quantity !== 'number') {
      return res.status(400).json({ message: 'session_id, id_cart_temp y quantity requeridos' });
    }
    const { error } = await supabase
      .from('cart_temp')
      .update({ quantity })
      .eq('session_id', session_id)
      .eq('id_cart_temp', id_cart_temp);
    if (error) {
      return res.status(500).json({ message: 'Error actualizando cantidad', error });
    }
    res.status(200).json({ message: 'Cantidad actualizada' });
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando cantidad', error: error.message });
  }
};

// Obtener productos del carrito autenticado de un usuario
exports.getCartByUser = async (req, res) => {
  const user_id = req.params.user_id || req.query.user_id;
  if (!user_id) {
    return res.status(400).json({ message: 'user_id requerido' });
  }
  try {
    const { data, error } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', user_id);
    if (error) throw error;
    res.status(200).json({ cart: data });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo el carrito', error: error.message });
  }
};


exports.transferTempCartToUser = async (req, res) => {
  const { session_id, user_id } = req.body;
  try {
   
    const { data: tempProducts, error: tempError } = await supabase
      .from('cart_temp')
      .select('*')
      .eq('session_id', session_id);

    if (tempError) throw tempError;

    if (tempProducts && tempProducts.length > 0) {
      
      const cartRows = tempProducts.map(item => ({
        user_id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_image: item.product_image,
        product_price: item.product_price,
        quantity: item.quantity,
        added_at: item.added_at,
      }));

    
      const { error: insertError } = await supabase
        .from('cart')
        .insert(cartRows);

      if (insertError) throw insertError;

 
      const { error: deleteError } = await supabase
        .from('cart_temp')
        .delete()
        .eq('session_id', session_id);

      if (deleteError) throw deleteError;
    }

    res.status(200).json({ message: 'Productos transferidos correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al transferir productos', error: error.message });
  }
};

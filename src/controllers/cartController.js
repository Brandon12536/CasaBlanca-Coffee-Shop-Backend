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
        .update({ quantity: existing.quantity + parseInt(quantity, 10) })
        .eq('id_cart_temp', existing.id_cart_temp);
    } else {

      await supabase
        .from('cart_temp')
        .insert([{ session_id, product_id, product_name, product_image, product_price: parseInt(product_price, 10), quantity: parseInt(quantity, 10) }]);
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

// Agregar producto al carrito autenticado
exports.addToCartUser = async (req, res) => {
  try {
    const { user_id, product_id, product_name, product_image, product_price, quantity } = req.body;
    console.log('[BACKEND][addToCartUser] Payload:', req.body);
    if (!user_id || !product_id || !product_name || !product_price) {
      console.warn('[BACKEND][addToCartUser] Missing required fields:', { user_id, product_id, product_name, product_price });
      return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

    // Verificar si ya existe el producto en el carrito de este usuario
    const { data: existing, error: findError } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', user_id)
      .eq('product_id', product_id);

    let wasUpdated = false;
    if (findError) {
      console.error('[BACKEND][addToCartUser] Error finding existing cart item:', findError);
    }

    if (existing && existing.length > 0) {
      // Si ya existe, actualizar la cantidad
      const existingItem = existing[0];
      await supabase
        .from('cart')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id_cart', existingItem.id_cart);
      wasUpdated = true;
    } else {
      // Si no existe, insertar nuevo registro
      await supabase
        .from('cart')
        .insert([{ user_id, product_id, product_name, product_image, product_price, quantity }]);
    }

    // Obtener el nuevo conteo de productos en el carrito (sumar cantidades, no solo contar filas)
    const { data: cartItems, error: countError } = await supabase
      .from('cart')
      .select('quantity')
      .eq('user_id', user_id);
    if (countError) {
      console.error('[BACKEND][addToCartUser] Error counting cart items:', countError);
      return res.status(500).json({ message: 'Error al contar productos en el carrito', error: countError.message });
    }
    const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
    console.log('[BACKEND][addToCartUser] New cart count (sum quantities):', cartCount);
    res.status(200).json({ success: true, cartCount });
  } catch (error) {
    console.error('[BACKEND][addToCartUser] Error:', error);
    res.status(500).json({ message: 'Error al agregar al carrito', error: error.message });
  }
};

// Eliminar producto del carrito autenticado
exports.deleteFromCartUser = async (req, res) => {
  try {
    const { id_cart } = req.body;
    if (!id_cart) {
      return res.status(400).json({ message: 'id_cart requerido' });
    }
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('id_cart', id_cart);
    if (error) {
      return res.status(500).json({ message: 'Error eliminando del carrito', error });
    }
    res.status(200).json({ message: 'Producto eliminado del carrito' });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando del carrito', error: error.message });
  }
};

// Actualizar cantidad en el carrito autenticado
exports.updateCartQtyUser = async (req, res) => {
  try {
    const { id_cart, quantity } = req.body;
    if (!id_cart || typeof quantity !== 'number') {
      return res.status(400).json({ message: 'id_cart y quantity requeridos' });
    }
    const { error } = await supabase
      .from('cart')
      .update({ quantity })
      .eq('id_cart', id_cart);
    if (error) {
      return res.status(500).json({ message: 'Error actualizando cantidad', error });
    }
    res.status(200).json({ message: 'Cantidad actualizada' });
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando cantidad', error: error.message });
  }
};

exports.transferTempCartToUser = async (req, res) => {
  const { session_id, user_id } = req.body;
  try {
    console.log('[DEBUG][transferTempCartToUser] session_id:', session_id, 'user_id:', user_id);
    const { data: tempProducts, error: tempError } = await supabase
      .from('cart_temp')
      .select('*')
      .eq('session_id', session_id);
    if (tempError) throw tempError;
    console.log('[DEBUG][transferTempCartToUser] tempProducts:', tempProducts);
    if (tempProducts && tempProducts.length > 0) {
      
      const productIds = tempProducts.map(item => item.product_id);
      await supabase.from('cart').delete().eq('user_id', user_id).in('product_id', productIds);
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
    } else {
      console.log('[DEBUG][transferTempCartToUser] No products found in cart_temp for session:', session_id);
    }
    res.status(200).json({ message: 'Productos transferidos correctamente' });
  } catch (error) {
    console.error('[DEBUG][transferTempCartToUser] Error:', error);
    res.status(500).json({ message: 'Error al transferir productos', error: error.message });
  }
};

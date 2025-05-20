const supabase = require('../config/supabase');

// Crear reseña
exports.createReview = async (req, res) => {
  try {
    const { user_id, product_id, comment, rating } = req.body;
    const { data, error } = await supabase
      .from('reviews')
      .insert([{ user_id, product_id, comment, rating }])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener reseñas por producto
exports.getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId);
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener reseñas por usuario
exports.getReviewsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Editar reseña
exports.updateReview = async (req, res) => {
  try {
    const { id_reviews } = req.params;
    const { comment, rating } = req.body;
    const { data, error } = await supabase
      .from('reviews')
      .update({ comment, rating })
      .eq('id_reviews', id_reviews)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar reseña
exports.deleteReview = async (req, res) => {
  try {
    const { id_reviews } = req.params;
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id_reviews', id_reviews);
    if (error) throw error;
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const supabase = require('../config/supabase');

const TABLE_NAME = 'products';


const categoryMap = {
  cafe: 'Café',
  café: 'Café',
  tes: 'tes',
  postres: 'postres',
  desayunos: 'desayunos',
  merch: 'merch',
  bebidas: 'bebidas',
  almuerzos: 'almuerzos',
};

const getAllProducts = async () => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*');
  
  if (error) throw error;
  return data;
};

const getProductById = async (id) => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

const createProduct = async (productData) => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert([productData])
    .select();
  
  if (error) throw error;
  return data[0];
};

const updateProduct = async (id, productData) => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(productData)
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data[0];
};

const deleteProduct = async (id) => {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return { success: true };
};

const getProductsByCategory = async (category) => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('category', category);
  
  if (error) throw error;
  return data;
};

const getFeaturedProducts = async () => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('featured', true);
  
  if (error) throw error;
  return data;
};


const getFilteredProducts = async ({ search, category, priceOrder, sort }) => {
  let query = supabase.from(TABLE_NAME).select('*');

  
  if (category) {
    if (category.toLowerCase().includes('cafe') || category.toLowerCase().includes('café')) {
      query = query.or('category.ilike.%cafe%,category.ilike.%café%');
    } else {
      const dbCategory = categoryMap[category.toLowerCase()] || category;
      query = query.eq('category', dbCategory);
    }
  }

 
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (priceOrder === 'asc') {
    query = query.order('price', { ascending: true });
  } else if (priceOrder === 'desc') {
    query = query.order('price', { ascending: false });
  }
  if (sort === 'recent') {
    query = query.order('created_at', { ascending: false });
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getFeaturedProducts,
  getFilteredProducts
};

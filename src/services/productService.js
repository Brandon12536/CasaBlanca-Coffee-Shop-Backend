const supabase = require("../config/supabase");
const { pesosToCents } = require("../utils/moneyUtils");

const PRODUCTS_TABLE = "products";

const categoryMap = {
  cafe: "café",
  café: "café",
  tes: "tes",
  postres: "postres",
  desayunos: "desayunos",
  merch: "merch",
  bebidas: "bebidas",
  almuerzos: "almuerzos",
};

function processProductData(productData) {
  if (typeof productData.price === "number") {
    productData.price = pesosToCents(productData.price);
  }
  return productData;
}

const getAllProducts = async () => {
  const { data, error } = await supabase.from(PRODUCTS_TABLE).select("*");
  if (error) throw error;
  return data; // Devuelve los datos directamente sin conversión
};

const getProductById = async (id) => {
  const { data, error } = await supabase
    .from(PRODUCTS_TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data; // Devuelve los datos directamente sin conversión
};

const createProduct = async (productData) => {
  const processedData = processProductData(productData);

  const { data, error } = await supabase
    .from(PRODUCTS_TABLE)
    .insert([processedData])
    .select();

  if (error) throw error;
  return data[0]; // Devuelve los datos directamente sin conversión
};

const updateProduct = async (id, productData) => {
  if (typeof productData.price === "number") {
    productData.price = pesosToCents(productData.price);
  }

  const { data, error } = await supabase
    .from(PRODUCTS_TABLE)
    .update(productData)
    .eq("id", id)
    .select();

  if (error) throw error;
  return data[0]; // Devuelve los datos directamente sin conversión
};

const deleteProduct = async (id) => {
  const { error } = await supabase.from(PRODUCTS_TABLE).delete().eq("id", id);
  if (error) throw error;
  return { success: true };
};

const getProductsByCategory = async (category) => {
  const { data, error } = await supabase
    .from(PRODUCTS_TABLE)
    .select("*")
    .eq("category", category);

  if (error) throw error;
  return data; // Devuelve los datos directamente sin conversión
};

const getFeaturedProducts = async () => {
  const { data, error } = await supabase
    .from(PRODUCTS_TABLE)
    .select("*")
    .eq("featured", true);

  if (error) throw error;
  return data; // Devuelve los datos directamente sin conversión
};

const getFilteredProducts = async ({ search, category, priceOrder, sort }) => {
  let query = supabase.from(PRODUCTS_TABLE).select("*");

  if (category) {
    if (
      category.toLowerCase().includes("cafe") ||
      category.toLowerCase().includes("café")
    ) {
      query = query.or("category.ilike.%cafe%,category.ilike.%café%");
    } else {
      const dbCategory = categoryMap[category.toLowerCase()] || category;
      query = query.eq("category", dbCategory);
    }
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (priceOrder === "asc") {
    query = query.order("price", { ascending: true });
  } else if (priceOrder === "desc") {
    query = query.order("price", { ascending: false });
  }

  if (sort === "recent") {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;
  return data; // Devuelve los datos directamente sin conversión
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getFeaturedProducts,
  getFilteredProducts,
};

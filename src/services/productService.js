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
  // Si no hay precio, retornar los datos sin modificar
  if (productData.price === undefined || productData.price === null) {
    console.log('Precio no proporcionado o nulo');
    return productData;
  }

  console.log('Precio recibido:', productData.price, 'tipo:', typeof productData.price);
  
  // Crear una copia del objeto para no modificar el original
  const processedData = { ...productData };
  
  // Variable para almacenar el precio procesado
  let precioProcesado;
  
  // Asegurarse de que el precio sea un número
  if (typeof processedData.price === 'string') {
    // Si es string, limpiar y convertir a número
    precioProcesado = parseFloat(processedData.price.toString().replace(/[^0-9.]/g, ''));
    console.log('Precio convertido a número:', precioProcesado);
  } else if (typeof processedData.price === 'number') {
    // Si ya es número, usarlo directamente
    precioProcesado = processedData.price;
  } else {
    // Si no es ni string ni número, establecer a 0
    precioProcesado = 0;
  }
  
  // Si después de la conversión es NaN, establecer a 0
  if (isNaN(precioProcesado)) {
    console.warn('El precio no es un número válido, se establece a 0');
    precioProcesado = 0;
  }
  
  // Redondear a número entero para Supabase
  precioProcesado = Math.round(precioProcesado);
  console.log('Precio redondeado a entero:', precioProcesado);
  
  // Asignar el precio procesado
  processedData.price = precioProcesado;
  
  console.log('Datos procesados:', processedData);
  return processedData;
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
  console.log('Datos recibidos en createProduct:', JSON.stringify(productData, null, 2));
  const processedData = processProductData({...productData});
  console.log('Datos procesados en createProduct:', JSON.stringify(processedData, null, 2));

  const { data, error } = await supabase
    .from(PRODUCTS_TABLE)
    .insert([processedData])
    .select();

  if (error) throw error;
  return data[0];
};

const updateProduct = async (id, productData) => {
  console.log('=== INICIO updateProduct ===');
  console.log('ID del producto a actualizar:', id);
  console.log('Datos recibidos en updateProduct:', JSON.stringify(productData, null, 2));
  
  // Verificar el tipo de dato del precio
  if (productData.price !== undefined) {
    console.log(`Tipo de dato del precio: ${typeof productData.price}, valor: ${productData.price}`);
  }
  
  const processedData = processProductData({...productData});
  console.log('Datos después de processProductData:', JSON.stringify(processedData, null, 2));
  
  console.log('Actualizando en Supabase...');
  try {
    const { data, error } = await supabase
      .from(PRODUCTS_TABLE)
      .update(processedData)
      .eq("id", id)
      .select();

    if (error) {
      console.error('Error al actualizar en Supabase:', error);
      throw error;
    }
    
    console.log('Actualización exitosa. Datos devueltos:', JSON.stringify(data[0], null, 2));
    return data[0];
  } catch (error) {
    console.error('Error en updateProduct:', error);
    throw error;
  }
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

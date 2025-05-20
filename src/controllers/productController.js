const productService = require('../services/productService');


exports.getAllProducts = async (req, res) => {
  try {
   
    const { search, category, priceOrder, sort } = req.query;
    let products;
    if (search || category || priceOrder || sort) {
      products = await productService.getFilteredProducts({ search, category, priceOrder, sort });
    } else {
      products = await productService.getAllProducts();
    }
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos', error: error.message });
  }
};


exports.getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el producto', error: error.message });
  }
};


exports.createProduct = async (req, res) => {
  try {
    const productData = { ...req.body, price: parseInt(req.body.price, 10) };
    const savedProduct = await productService.createProduct(productData);
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear el producto', error: error.message });
  }
};


exports.updateProduct = async (req, res) => {
  try {
    const updatedProduct = await productService.updateProduct(req.params.id, { ...req.body, price: parseInt(req.body.price, 10) });
    
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar el producto', error: error.message });
  }
};


exports.deleteProduct = async (req, res) => {
  try {
    const result = await productService.deleteProduct(req.params.id);
    
    if (!result.success) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    res.status(200).json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el producto', error: error.message });
  }
};


exports.getProductsByCategory = async (req, res) => {
  try {
    const products = await productService.getProductsByCategory(req.params.category);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos por categoría', error: error.message });
  }
};


exports.getFeaturedProducts = async (req, res) => {
  try {
    const featuredProducts = await productService.getFeaturedProducts();
    res.status(200).json(featuredProducts);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos destacados', error: error.message });
  }
};

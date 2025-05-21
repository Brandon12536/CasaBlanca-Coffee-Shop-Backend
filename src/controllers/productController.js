// ./src/controllers/productController.js
const Product = require("../models/Product");
const productService = require("../services/productService");
const { pesosToCents } = require("../utils/moneyUtils");
const { validationResult } = require("express-validator");

class ProductController {
  /**
   * Obtiene todos los productos (precios en centavos como en BD)
   */
  async getAllProducts(req, res) {
    try {
      const { search, category, priceOrder, sort } = req.query;
      let products;

      if (search || category || priceOrder || sort) {
        products = await productService.getFilteredProducts({
          search,
          category,
          priceOrder,
          sort,
        });
      } else {
        products = await productService.getAllProducts();
      }

      res.status(200).json(products);
    } catch (error) {
      console.error("Error en getAllProducts:", error.message);
      res.status(500).json({
        message: "Error al obtener productos",
        error: error.message,
      });
    }
  }

  /**
   * Obtiene un producto por ID (precio en centavos como en BD)
   */
  async getProductById(req, res) {
    try {
      const product = await productService.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener el producto",
        error: error.message,
      });
    }
  }

  /**
   * Crea un nuevo producto (conversión a centavos solo para almacenamiento)
   */
  async createProduct(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const productData = req.body;
      const savedProduct = await productService.createProduct(productData);
      res.status(201).json(savedProduct);
    } catch (error) {
      res.status(400).json({
        message: "Error al crear el producto",
        error: error.message,
      });
    }
  }

  /**
   * Actualiza un producto (conversión a centavos solo para almacenamiento)
   */
  async updateProduct(req, res) {
    console.log('=== INICIO updateProduct ===');
    console.log('Datos recibidos en el body:', JSON.stringify(req.body, null, 2));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Errores de validación:', errors.array());
      return res.status(400).json({ 
        message: 'Error de validación',
        errors: errors.array() 
      });
    }

    try {
      const productData = req.body;
      console.log('Datos antes de actualizar:', JSON.stringify(productData, null, 2));
      
      const updatedProduct = await productService.updateProduct(
        req.params.id,
        productData
      );
      
      console.log('Producto actualizado con éxito:', JSON.stringify(updatedProduct, null, 2));

      if (!updatedProduct) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }

      res.status(200).json(updatedProduct);
    } catch (error) {
      res.status(400).json({
        message: "Error al actualizar el producto",
        error: error.message,
      });
    }
  }

  /**
   * Elimina un producto por ID
   */
  async deleteProduct(req, res) {
    try {
      const result = await productService.deleteProduct(req.params.id);

      if (!result.success) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }

      res.status(200).json({ message: "Producto eliminado correctamente" });
    } catch (error) {
      res.status(500).json({
        message: "Error al eliminar el producto",
        error: error.message,
      });
    }
  }

  /**
   * Obtiene productos por categoría (precios en centavos como en BD)
   */
  async getProductsByCategory(req, res) {
    try {
      const products = await productService.getProductsByCategory(
        req.params.category
      );
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener productos por categoría",
        error: error.message,
      });
    }
  }

  /**
   * Obtiene productos destacados (precios en centavos como en BD)
   */
  async getFeaturedProducts(req, res) {
    try {
      const featuredProducts = await productService.getFeaturedProducts();
      res.status(200).json(featuredProducts);
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener productos destacados",
        error: error.message,
      });
    }
  }

  /**
   * Buscar productos (precios en centavos como en BD)
   */
  async searchProducts(req, res) {
    try {
      const { query, category } = req.query;
      let searchConditions = {};

      if (query) {
        searchConditions.name = { $regex: query, $options: "i" };
      }

      if (category) {
        searchConditions.category = { $regex: category, $options: "i" };
      }

      const products = await Product.find(searchConditions);
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({
        message: "Error al buscar productos",
        error: error.message,
      });
    }
  }
}

module.exports = new ProductController();

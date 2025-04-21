/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - category
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único del producto
 *         name:
 *           type: string
 *           description: Nombre del producto
 *         description:
 *           type: string
 *           description: Descripción del producto
 *         price:
 *           type: number
 *           description: Precio del producto
 *         category:
 *           type: string
 *           description: Categoría del producto
 *         image:
 *           type: string
 *           description: URL de la imagen
 *         available:
 *           type: boolean
 *           description: ¿Está disponible?
 *         featured:
 *           type: boolean
 *           description: ¿Es destacado?
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *       example:
 *         id: "e9b1b7e4-8d33-4b3c-9b1f-4f3e2f6e3a1f"
 *         name: "Café Latte"
 *         description: "Café espresso con leche vaporizada."
 *         price: 65
 *         category: "café"
 *         image: "https://placehold.co/400x300?text=Café+Latte"
 *         available: true
 *         featured: false
 *         created_at: "2025-04-17T15:17:19Z"
 */
/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Obtiene la lista de todos los productos
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Lista completa de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Agrega un nuevo producto
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Producto creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Error en los datos
 *       401:
 *         description: No autorizado
 */
/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Obtiene un producto por ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Producto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Producto no encontrado
 */
/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Actualiza un producto por ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Producto actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Error en los datos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Producto no encontrado
 */
/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Elimina un producto por ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Producto eliminado
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Producto no encontrado
 */

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Rutas para productos
// Obtener todos los productos (pública, sin autenticación)
router.get('/', productController.getAllProducts);

// Crear un producto (protegido)
router.post('/', protect, authorize('admin'), productController.createProduct);

// Obtener un solo producto por ID
router.get('/:id', productController.getProductById);

// Actualizar un producto (protegido)
router.put('/:id', protect, authorize('admin'), productController.updateProduct);

// Eliminar un producto (protegido)
router.delete('/:id', protect, authorize('admin'), productController.deleteProduct);

// Obtener productos por categoría
router.get('/category/:category', productController.getProductsByCategory);

// Obtener productos destacados
router.get('/featured', productController.getFeaturedProducts);

module.exports = router;

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const cartController = require('../controllers/cartController');


const cartTempStore = {};

/**
 * @swagger
 * tags:
 *   name: CartTemp
 *   description: API para el carrito temporal de visitantes
 */

/**
 * @swagger
 * /api/cart/temp:
 *   post:
 *     summary: Agrega un producto al carrito temporal
 *     tags: [CartTemp]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               session_id:
 *                 type: string
 *               product_id:
 *                 type: string
 *               product_name:
 *                 type: string
 *               product_image:
 *                 type: string
 *               product_price:
 *                 type: number
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Producto agregado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 cartCount:
 *                   type: integer
 */

router.post('/temp', (req, res) => {
  console.log('POST /api/cart/temp BODY:', req.body);
  const { session_id, product_id, product_name, product_image, product_price, quantity = 1 } = req.body;
  if (!session_id || !product_id) {
    return res.status(400).json({ error: 'session_id y product_id requeridos' });
  }
  if (!cartTempStore[session_id]) cartTempStore[session_id] = [];

  
  const existingIdx = cartTempStore[session_id].findIndex(p => p.product_id === product_id);
  if (existingIdx !== -1) {
   
    cartTempStore[session_id][existingIdx].quantity += quantity;
  } else {
    
    cartTempStore[session_id].push({
      id_cart_temp: uuidv4(),
      product_id,
      product_name,
      product_image,
      product_price,
      quantity
    });
  }
  res.json({ ok: true, cartCount: cartTempStore[session_id].reduce((sum, p) => sum + p.quantity, 0) });
});

/**
 * @swagger
 * /api/cart/temp/count:
 *   get:
 *     summary: Obtiene el contador de productos en el carrito temporal
 *     tags: [CartTemp]
 *     parameters:
 *       - in: query
 *         name: session_id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Contador de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cartCount:
 *                   type: integer
 */

router.get('/temp/count', (req, res) => {
  const { session_id } = req.query;
  const count = cartTempStore[session_id]?.reduce((sum, p) => sum + p.quantity, 0) || 0;
  res.json({ cartCount: count });
});

/**
 * @swagger
 * /api/cart/temp:
 *   get:
 *     summary: Obtiene todos los productos del carrito temporal
 *     tags: [CartTemp]
 *     parameters:
 *       - in: query
 *         name: session_id
 *         schema:
 *           type: string
 *         required: false
 *         description: Si no se envía, devuelve todos los carritos temporales existentes
 *     responses:
 *       200:
 *         description: Lista de productos en el carrito (o todos los carritos si no se pasa session_id)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_cart_temp:
 *                     type: string
 *                   product_id:
 *                     type: string
 *                   product_name:
 *                     type: string
 *                   product_image:
 *                     type: string
 *                   product_price:
 *                     type: number
 *                   quantity:
 *                     type: integer
 */

router.get('/temp', async (req, res) => {
  const { session_id } = req.query;
  if (session_id) {
    const items = cartTempStore[session_id] || [];
   
    const result = items.map((item, idx) => ({
      id_cart_temp: item.id_cart_temp || item.id || idx.toString(),
      ...item,
    }));
    return res.json(result);
  } else {
    
    let allItems = [];
    Object.keys(cartTempStore).forEach(sid => {
      const items = cartTempStore[sid] || [];
      allItems = allItems.concat(
        items.map((item, idx) => ({
          id_cart_temp: item.id_cart_temp || item.id || idx.toString(),
          ...item,
          session_id: sid,
        }))
      );
    });
    return res.json(allItems);
  }
});


router.post('/temp/update-qty', (req, res, next) => {
  console.log('[BACKEND DEBUG] update-qty body:', req.body);
  next();
}, (req, res) => {
  const { session_id, id_cart_temp, quantity } = req.body;
  if (!session_id || !id_cart_temp || typeof quantity !== 'number') {
    return res.status(400).json({ message: 'session_id, id_cart_temp y quantity requeridos' });
  }
  const items = cartTempStore[session_id] || [];
  const idx = items.findIndex(p => p.id_cart_temp === id_cart_temp);
  if (idx === -1) {
    return res.status(404).json({ message: 'Producto no encontrado en carrito' });
  }
  items[idx].quantity = quantity;
  res.status(200).json({ message: 'Cantidad actualizada' });
});


router.post('/temp/delete', (req, res, next) => {
  console.log('[BACKEND DEBUG] delete body:', req.body);
  next();
}, (req, res) => {
  const { session_id, id_cart_temp } = req.body;
  if (!session_id || !id_cart_temp) {
    return res.status(400).json({ message: 'session_id y id_cart_temp requeridos' });
  }
  const items = cartTempStore[session_id] || [];
  const idx = items.findIndex(p => p.id_cart_temp === id_cart_temp);
  if (idx === -1) {
    return res.status(404).json({ message: 'Producto no encontrado en carrito' });
  }
  items.splice(idx, 1);
  res.status(200).json({ message: 'Producto eliminado del carrito' });
});

/**
 * @swagger
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       required:
 *         - id_cart
 *         - user_id
 *         - product_id
 *         - product_name
 *         - product_price
 *         - quantity
 *       properties:
 *         id_cart:
 *           type: string
 *           format: uuid
 *           description: ID único del ítem en el carrito
 *         user_id:
 *           type: string
 *           format: uuid
 *           description: ID del usuario propietario del carrito
 *         product_id:
 *           type: string
 *           format: uuid
 *           description: ID del producto
 *         product_name:
 *           type: string
 *           description: Nombre del producto
 *         product_image:
 *           type: string
 *           description: URL de la imagen del producto
 *         product_price:
 *           type: number
 *           format: float
 *           description: Precio del producto
 *         quantity:
 *           type: integer
 *           default: 1
 *           description: Cantidad de productos
 *         added_at:
 *           type: string
 *           format: date-time
 *           description: Fecha en que se agregó el producto al carrito
 *       example:
 *         id_cart: "e9b1b7e4-8d33-4b3c-9b1f-4f3e2f6e3a1f"
 *         user_id: "d290f1ee-6c54-4b01-90e6-d701748f0851"
 *         product_id: "f3e2f6e3-a1f4-4b3c-9b1f-e9b1b7e48d33"
 *         product_name: "Café Americano"
 *         product_image: "https://placehold.co/400x300?text=Café+Americano"
 *         product_price: 45.50
 *         quantity: 2
 *         added_at: "2025-04-23T15:38:06Z"
 */

/**
 * @swagger
 * /api/cart/user/{user_id}:
 *   get:
 *     summary: Obtiene el carrito de un usuario autenticado
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Carrito del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cart:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CartItem'
 */

router.get('/user/:user_id', cartController.getCartByUser);

/**
 * @swagger
 * /api/cart/user/add:
 *   post:
 *     summary: Agrega un producto al carrito de un usuario autenticado
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *               product_id:
 *                 type: string
 *               product_name:
 *                 type: string
 *               product_image:
 *                 type: string
 *               product_price:
 *                 type: number
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Producto agregado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 cartCount:
 *                   type: integer
 */
router.post('/user/add', cartController.addToCartUser);

/**
 * @swagger
 * /api/cart/transfer-temp-to-user:
 *   post:
 *     summary: Mueve productos del carrito temporal al carrito del usuario autenticado
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               session_id:
 *                 type: string
 *               user_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Productos transferidos correctamente
 */
router.post('/transfer-temp-to-user', cartController.transferTempCartToUser);

/**
 * @swagger
 * /api/cart/user/delete:
 *   post:
 *     summary: Elimina un producto del carrito de un usuario autenticado
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_cart:
 *                 type: string
 *                 description: ID del producto en el carrito
 *     responses:
 *       200:
 *         description: Producto eliminado del carrito
 *       400:
 *         description: id_cart requerido
 *       500:
 *         description: Error eliminando del carrito
 */
router.post('/user/delete', cartController.deleteFromCartUser);

/**
 * @swagger
 * /api/cart/user/update-qty:
 *   post:
 *     summary: Actualiza la cantidad de un producto en el carrito de un usuario autenticado
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_cart:
 *                 type: string
 *                 description: ID del producto en el carrito
 *               quantity:
 *                 type: integer
 *                 description: Nueva cantidad
 *     responses:
 *       200:
 *         description: Cantidad actualizada
 *       400:
 *         description: id_cart y quantity requeridos
 *       500:
 *         description: Error actualizando cantidad
 */
router.post('/user/update-qty', cartController.updateCartQtyUser);

router.get('/test', (req, res) => {
  res.json({ ok: true });
});

module.exports = router;
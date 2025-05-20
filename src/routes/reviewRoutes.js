const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Crear una nueva reseña
 *     tags: [Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewCreate'
 *           example:
 *             user_id: "uuid-del-usuario"
 *             product_id: "uuid-del-producto"
 *             comment: "Texto de la reseña"
 *             rating: 5
 *     responses:
 *       201:
 *         description: Reseña creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 */
router.post('/', reviewController.createReview);

/**
 * @swagger
 * /api/reviews/product/{productId}:
 *   get:
 *     summary: Obtener reseñas por producto
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Lista de reseñas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *             example:
 *               - id_reviews: "1"
 *                 user_id: "uuid-usuario"
 *                 product_id: "uuid-producto"
 *                 comment: "Muy buen café"
 *                 rating: 5
 *                 created_at: "2025-05-20T18:44:56.844Z"
 */
router.get('/product/:productId', reviewController.getReviewsByProduct);

/**
 * @swagger
 * /api/reviews/user/{userId}:
 *   get:
 *     summary: Obtener reseñas por usuario
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Lista de reseñas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *             example:
 *               - id_reviews: "1"
 *                 user_id: "uuid-usuario"
 *                 product_id: "uuid-producto"
 *                 comment: "Excelente atención"
 *                 rating: 4
 *                 created_at: "2025-05-20T18:44:56.844Z"
 */
router.get('/user/:userId', reviewController.getReviewsByUser);

/**
 * @swagger
 * /api/reviews/{id_reviews}:
 *   put:
 *     summary: Editar una reseña
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id_reviews
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la reseña
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewCreate'
 *           example:
 *             user_id: "uuid-usuario"
 *             product_id: "uuid-producto"
 *             comment: "Comentario actualizado"
 *             rating: 4
 *     responses:
 *       200:
 *         description: Reseña actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 */
router.put('/:id_reviews', reviewController.updateReview);

/**
 * @swagger
 * /api/reviews/{id_reviews}:
 *   delete:
 *     summary: Eliminar una reseña
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id_reviews
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la reseña
 *     responses:
 *       200:
 *         description: Reseña eliminada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Review deleted"
 */
router.delete('/:id_reviews', reviewController.deleteReview);

module.exports = router;
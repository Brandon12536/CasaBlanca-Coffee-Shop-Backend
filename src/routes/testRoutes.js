const express = require("express");
const router = express.Router();
const testController = require("../controllers/testController");

/**
 * @swagger
 * /api/test/token:
 *   get:
 *     summary: Generar un token de prueba
 *     description: Genera un token JWT de prueba para facilitar las pruebas de la API
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: Token generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token JWT para autenticación
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID del usuario
 *                     email:
 *                       type: string
 *                       description: Email del usuario
 *                     role:
 *                       type: string
 *                       description: Rol del usuario
 *                 message:
 *                   type: string
 *                   description: Mensaje informativo
 *       500:
 *         description: Error al generar el token
 */
router.get("/token", testController.generateTestToken);

module.exports = router;

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Rutas públicas
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único del usuario
 *         name:
 *           type: string
 *           description: Nombre completo del usuario
 *         email:
 *           type: string
 *           description: Correo electrónico único
 *         password:
 *           type: string
 *           description: Contraseña encriptada
 *         role:
 *           type: string
 *           description: Rol del usuario (ej. cliente, admin)
 *           example: cliente
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *       example:
 *         id: "d290f1ee-6c54-4b01-90e6-d701748f0851"
 *         name: "Juan Pérez"
 *         email: "juan@example.com"
 *         password: "hashedpassword123"
 *         role: "cliente"
 *         created_at: "2025-04-17T15:17:19Z"
 */
/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Error en los datos o usuario ya existe
 */
/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Inicia sesión de usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: Correo electrónico del usuario
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario
 *     responses:
 *       200:
 *         description: Login exitoso, retorna token JWT y datos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT para autenticación
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Credenciales inválidas
 */
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Rutas protegidas
/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Obtiene el perfil del usuario autenticado (o vacío si no autenticado)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Perfil del usuario o vacío
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get('/profile', userController.getUserProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Actualiza el perfil del usuario autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *           example:
 *             name: "Nuevo Nombre"
 *             email: "nuevo@email.com"
 *             password: "nuevacontraseña"
 *     responses:
 *       200:
 *         description: Perfil actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Error en los datos
 *       401:
 *         description: No autorizado
 */
router.put('/profile', protect, userController.updateUserProfile);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Elimina un usuario por ID (solo admin)
 *     tags: [Users]
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
 *         description: Usuario eliminado
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/:id', protect, authorize('admin'), userController.deleteUser);

/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     summary: Cierra la sesión del usuario
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Sesión cerrada correctamente
 */
router.post('/logout', (req, res) => {
  // Si usas JWT, el logout es manejado en el frontend (elimina el token)
  // Si usas sesiones en servidor, aquí destruirías la sesión
  res.status(200).json({ message: 'Sesión cerrada correctamente' });
});

module.exports = router;

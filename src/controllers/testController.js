const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

/**
 * Controlador para generar un token de prueba
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.generateTestToken = async (req, res) => {
  try {
    // Buscar un usuario existente para usar en el token
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    if (!users || users.length === 0) {
      return res.status(404).json({
        message: "No se encontraron usuarios para generar el token de prueba"
      });
    }
    
    const user = users[0];
    
    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role || 'customer' },
      process.env.JWT_SECRET || 'casablanca-secret-key',
      { expiresIn: '1h' }
    );
    
    // Devolver el token y la información del usuario
    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      message: "Token de prueba generado correctamente. Úsalo en el header 'Authorization: Bearer TOKEN'"
    });
    
  } catch (error) {
    console.error("Error al generar token de prueba:", error);
    res.status(500).json({
      message: "Error al generar token de prueba",
      error: error.message
    });
  }
};

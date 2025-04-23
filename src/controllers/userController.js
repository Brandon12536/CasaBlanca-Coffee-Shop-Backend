const userService = require('../services/userService');


exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
 
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Por favor, proporcione todos los campos requeridos' });
    }
    
   
    const result = await userService.registerUser({
      name,
      email,
      password,
      role: role || 'customer'
    });
    
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: 'Error al registrar usuario', error: error.message });
  }
};


exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
   
    if (!email || !password) {
      return res.status(400).json({ message: 'Por favor, proporcione email y contraseña' });
    }
    
 
    const result = await userService.loginUser(email, password);
    
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ message: 'Credenciales inválidas', error: error.message });
  }
};


exports.getUserProfile = async (req, res) => {
  try {
   
    if (!req.user || !req.user.id) {
      return res.status(200).json({});
    }
    const user = await userService.getUserProfile(req.user.id);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener perfil de usuario', error: error.message });
  }
};


exports.updateUserProfile = async (req, res) => {
  try {
    const updatedUser = await userService.updateUserProfile(req.user.id, req.body);
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar perfil de usuario', error: error.message });
  }
};


exports.deleteUser = async (req, res) => {
  try {
    const result = await userService.deleteUser(req.params.id);
    if (!result.success) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.status(200).json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el usuario', error: error.message });
  }
};

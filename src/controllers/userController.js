const userService = require('../services/userService');


exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role, telefono } = req.body;
    
 
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Por favor, proporcione todos los campos requeridos' });
    }
    
   
    const result = await userService.registerUser({
      name,
      email,
      password,
      telefono,
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


exports.getUserProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserProfile(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener perfil de usuario', error: error.message });
  }
};


exports.updateUserProfile = async (req, res) => {
  try {
    const updatedUser = await userService.updateUserProfile(req.user.id, req.body);
    res.status(200).json({ ...updatedUser, telefono: updatedUser.telefono });
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


exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error interno', error: error.message });
  }
};

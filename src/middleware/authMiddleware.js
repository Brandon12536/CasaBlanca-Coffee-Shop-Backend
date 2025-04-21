const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');


const protect = async (req, res, next) => {
  let token;
  

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
    
      token = req.headers.authorization.split(' ')[1];
      
     
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
     
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role')
        .eq('id', decoded.id)
        .single();
      
      if (error) {
        return res.status(401).json({ message: 'No autorizado, token inválido' });
      }
      
      
      req.user = data;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'No autorizado, token inválido' });
    }
  }
  
  if (!token) {
    res.status(401).json({ message: 'No autorizado, no se proporcionó token' });
  }
};


const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autorizado' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'No tiene permiso para realizar esta acción' });
    }
    
    next();
  };
};

module.exports = { protect, authorize };

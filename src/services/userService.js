const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const TABLE_NAME = 'users';


const registerUser = async (userData) => {

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);
  

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert([{
      ...userData,
      password: hashedPassword
    }])
    .select();
  
  if (error) throw error;

  const token = generateToken(data[0].id);
  
  return {
    user: {
      id: data[0].id,
      name: data[0].name,
      email: data[0].email,
      role: data[0].role
    },
    token
  };
};


const loginUser = async (email, password) => {

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('email', email)
    .single();
  
  if (error) throw new Error('Usuario no encontrado');
  
  
  const isMatch = await bcrypt.compare(password, data.password);
  if (!isMatch) throw new Error('Credenciales inválidas');
  
  
  const token = generateToken(data.id);
  
  return {
    user: {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role
    },
    token
  };
};


const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('id, name, email, role, created_at')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};


const updateUserProfile = async (userId, userData) => {
  
  const allowedFields = ['name', 'email', 'password'];
  const updateData = {};
  for (const key of allowedFields) {
    if (userData[key] !== undefined) updateData[key] = userData[key];
  }

  if (updateData.password) {
    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(updateData.password, salt);
  }
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(updateData)
    .eq('id', userId)
    .select('id, name, email, role');
  if (error) throw error;
  return data[0];
};


const deleteUser = async (id) => {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id);
  if (error) {
    if (error.code === 'PGRST116') {
     
      return { success: false };
    }
    throw error;
  }
  return { success: true };
};


const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUser
};

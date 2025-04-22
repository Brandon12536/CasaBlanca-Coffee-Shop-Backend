const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');


router.post('/', async (req, res) => {
  const {
    nombre_completo,
    correo_electronico,
    fecha_visita,
    hora_visita,
    numero_personas,
    notas_adicionales,
    telefono
  } = req.body;

  try {
    const { data, error } = await supabase.from('reservaciones').insert([
      {
        nombre_completo,
        correo_electronico,
        fecha_visita,
        hora_visita,
        numero_personas,
        notas_adicionales: notas_adicionales || null,
        telefono
      }
    ]).select('id_reservaciones, created_at');

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    console.error('Error al guardar la reservación:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});


router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('reservaciones').select('*');
    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});


router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase.from('reservaciones').select('*').eq('id_reservaciones', id).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, error: 'Reservación no encontrada' });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});


router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  try {
    const { data, error } = await supabase.from('reservaciones').update(updateData).eq('id_reservaciones', id).select();
    if (error) throw error;
    if (!data || data.length === 0) return res.status(404).json({ success: false, error: 'Reservación no encontrada' });
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});


router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase.from('reservaciones').delete().eq('id_reservaciones', id).select();
    if (error) throw error;
    if (!data || data.length === 0) return res.status(404).json({ success: false, error: 'Reservación no encontrada' });
    res.status(200).json({ success: true, message: 'Reservación eliminada exitosamente' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

module.exports = router;

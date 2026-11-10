import pool from '../db.js';

export const getVacunas = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vacuna');
    res.json(rows);
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
};

export const getVacunaciones = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT v.id, v.fecha_aplicacion as fecha, v.dosis, vac.nombre as vacuna_nombre, a.caravana 
      FROM vacunacion v
      JOIN animal a ON v.animal_id = a.id
      JOIN vacuna vac ON v.vacuna_id = vac.id
      ORDER BY v.id DESC
    `);
    res.json(rows);
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
};

export const createVacunacion = async (req, res) => {
  const { animal_id, vacuna_id, fecha, dosis } = req.body;
  try {
    await pool.query(
      'INSERT INTO vacunacion (animal_id, vacuna_id, fecha_aplicacion, dosis) VALUES (?, ?, ?, ?)',
      [animal_id, vacuna_id, fecha, dosis]
    );
    res.status(201).json({ message: 'Vacunación registrada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteVacunacion = async (req, res) => {
  try {
    await pool.query('DELETE FROM vacunacion WHERE id = ?', [req.params.id]);
    res.json({ message: 'Registro de vacunación eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
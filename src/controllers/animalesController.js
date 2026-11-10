import pool from '../db.js';

export const getAnimales = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Animal');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

export const createAnimal = async (req, res) => {
  const { caravana, sexo, fecha_nacimiento, peso, estado, potrero_id, especie_raza_id } = req.body;
  try {
    await pool.query(
      'INSERT INTO Animal (caravana, sexo, fecha_nacimiento, peso, estado, potrero_id, especie_raza_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [caravana, sexo, fecha_nacimiento, peso, estado, potrero_id || 1, especie_raza_id || 1]
    );
    res.status(201).json({ message: 'Animal creado' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

export const deleteAnimal = async (req, res) => {
  try {
    await pool.query('DELETE FROM Animal WHERE id = ?', [req.params.id]);
    res.json({ message: 'Animal eliminado' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};
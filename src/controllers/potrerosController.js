import pool from '../db.js';

export const getPotreros = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Potrero');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

export const createPotrero = async (req, res) => {
  const { nombre, superficie, capacidad } = req.body;
  try {
    await pool.query('INSERT INTO Potrero (nombre, superficie, capacidad) VALUES (?, ?, ?)', [nombre, superficie, capacidad]);
    res.status(201).json({ message: 'Potrero creado' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

export const deletePotrero = async (req, res) => {
  try {
    await pool.query('DELETE FROM Potrero WHERE id = ?', [req.params.id]);
    res.json({ message: 'Potrero eliminado' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};
import pool from '../db.js';

// Operaciones de consulta y mantenimiento del catalogo de potreros.
export const getPotreros = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM potrero');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Busca un potrero por id; el parametro viene de la URL.
export const getPotreroById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM potrero WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Potrero no encontrado' });
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Crea un potrero a partir de los datos enviados en el cuerpo de la peticion.
export const createPotrero = async (req, res) => {
  const { nombre, superficie, capacidad } = req.body;
  try {
    await pool.query('INSERT INTO potrero (nombre, superficie, capacidad) VALUES (?, ?, ?)', [nombre, superficie, capacidad]);
    res.status(201).json({ message: 'Potrero creado' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Actualiza nombre, superficie y capacidad del potrero indicado.
export const updatePotrero = async (req, res) => {
  const { nombre, superficie, capacidad } = req.body;
  try {
    await pool.query('UPDATE potrero SET nombre = ?, superficie = ?, capacidad = ? WHERE id = ?', [nombre, superficie, capacidad, req.params.id]);
    res.json({ message: 'Potrero actualizado' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// La base puede rechazar el borrado si hay animales vinculados al potrero.
export const deletePotrero = async (req, res) => {
  try {
    await pool.query('DELETE FROM potrero WHERE id = ?', [req.params.id]);
    res.json({ message: 'Potrero eliminado' });
  } catch (error) { res.status(500).json({ error: 'No se puede eliminar: tiene animales asociados.' }); }
};
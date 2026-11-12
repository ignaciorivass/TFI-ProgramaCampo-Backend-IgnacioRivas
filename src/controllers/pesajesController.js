import pool from '../db.js';

export const getPesajes = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id, p.fecha, p.peso, p.observaciones, a.caravana 
      FROM pesaje p
      JOIN animal a ON p.animal_id = a.id
      ORDER BY p.fecha DESC
    `);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

export const getPesajeById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pesaje WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Pesaje no encontrado' });
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

export const createPesaje = async (req, res) => {
  const { animal_id, fecha, peso, observaciones } = req.body;
  try {
    await pool.query(
      'INSERT INTO pesaje (animal_id, fecha, peso, observaciones) VALUES (?, ?, ?, ?)',
      [animal_id, fecha, peso, observaciones || '']
    );
    await pool.query('UPDATE animal SET peso = ? WHERE id = ?', [peso, animal_id]);
    res.status(201).json({ message: 'Pesaje registrado' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

export const updatePesaje = async (req, res) => {
  const { animal_id, fecha, peso, observaciones } = req.body;
  try {
    await pool.query(
      'UPDATE pesaje SET animal_id = ?, fecha = ?, peso = ?, observaciones = ? WHERE id = ?',
      [animal_id, fecha ? fecha.split('T')[0] : null, peso, observaciones || '', req.params.id]
    );
    await pool.query('UPDATE animal SET peso = ? WHERE id = ?', [peso, animal_id]);
    res.json({ message: 'Pesaje actualizado' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

export const deletePesaje = async (req, res) => {
  try {
    await pool.query('DELETE FROM pesaje WHERE id = ?', [req.params.id]);
    res.json({ message: 'Pesaje eliminado' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};
import pool from '../db.js';

export const getMovimientos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT m.id, m.fecha, m.tipo, a.caravana, po.nombre as origen, pd.nombre as destino 
      FROM movimiento m
      JOIN animal a ON m.animal_id = a.id
      LEFT JOIN potrero po ON m.origen_potrero_id = po.id
      LEFT JOIN potrero pd ON m.destino_potrero_id = pd.id
      ORDER BY m.fecha DESC
    `);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

export const getMovimientoById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM movimiento WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Movimiento no encontrado' });
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

export const createMovimiento = async (req, res) => {
  const { animal_id, fecha, tipo, origen_potrero_id, destino_potrero_id } = req.body;
  try {
    await pool.query(
      'INSERT INTO movimiento (animal_id, fecha, tipo, origen_potrero_id, destino_potrero_id) VALUES (?, ?, ?, ?, ?)',
      [animal_id, fecha, tipo, origen_potrero_id || null, destino_potrero_id || null]
    );
    res.status(201).json({ message: 'Movimiento registrado' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

export const updateMovimiento = async (req, res) => {
  const { animal_id, fecha, tipo, origen_potrero_id, destino_potrero_id } = req.body;
  try {
    await pool.query(
      'UPDATE movimiento SET animal_id = ?, fecha = ?, tipo = ?, origen_potrero_id = ?, destino_potrero_id = ? WHERE id = ?',
      [animal_id, fecha ? fecha.split('T')[0] : null, tipo, origen_potrero_id || null, destino_potrero_id || null, req.params.id]
    );
    res.json({ message: 'Movimiento actualizado' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

export const deleteMovimiento = async (req, res) => {
  try {
    await pool.query('DELETE FROM movimiento WHERE id = ?', [req.params.id]);
    res.json({ message: 'Movimiento eliminado correctamente' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};
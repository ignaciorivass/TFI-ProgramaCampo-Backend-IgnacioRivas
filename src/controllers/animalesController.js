import pool from '../db.js';

export const getAnimales = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.*, 
             p.nombre AS potrero_nombre,
             m.caravana AS madre_caravana,
             pa.caravana AS padre_caravana
      FROM animal a
      LEFT JOIN potrero p ON a.potrero_id = p.id
      LEFT JOIN animal m ON a.madre_id = m.id
      LEFT JOIN animal pa ON a.padre_id = pa.id
      ORDER BY a.id DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAnimalById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM animal WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Animal no encontrado' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createAnimal = async (req, res) => {
  const { caravana, especie, raza, sexo, fecha_nacimiento, peso, origen, madre_id, padre_id, potrero_id, estado } = req.body;
  try {
    await pool.query(
      `INSERT INTO animal (caravana, especie, raza, sexo, fecha_nacimiento, peso, origen, madre_id, padre_id, potrero_id, estado) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        caravana,
        especie || 'Bovino',
        raza || '',
        sexo,
        fecha_nacimiento || null,
        peso || 0,
        origen || 'Compra',
        origen === 'Nacimiento' && madre_id ? madre_id : null,
        origen === 'Nacimiento' && padre_id ? padre_id : null,
        potrero_id || null,
        estado || 'Activo'
      ]
    );
    res.status(201).json({ message: 'Animal registrado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateAnimal = async (req, res) => {
  const { caravana, especie, raza, sexo, fecha_nacimiento, peso, origen, madre_id, padre_id, potrero_id, estado } = req.body;
  try {
    await pool.query(
      `UPDATE animal 
       SET caravana = ?, especie = ?, raza = ?, sexo = ?, fecha_nacimiento = ?, peso = ?, 
           origen = ?, madre_id = ?, padre_id = ?, potrero_id = ?, estado = ?
       WHERE id = ?`,
      [
        caravana,
        especie || 'Bovino',
        raza || '',
        sexo,
        fecha_nacimiento ? fecha_nacimiento.split('T')[0] : null,
        peso || 0,
        origen || 'Compra',
        origen === 'Nacimiento' && madre_id ? madre_id : null,
        origen === 'Nacimiento' && padre_id ? padre_id : null,
        potrero_id || null,
        estado || 'Activo',
        req.params.id
      ]
    );
    res.json({ message: 'Animal actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteAnimal = async (req, res) => {
  try {
    await pool.query('DELETE FROM animal WHERE id = ?', [req.params.id]);
    res.json({ message: 'Animal eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'No se puede eliminar: el animal tiene movimientos o vacunas asociadas.' });
  }
};
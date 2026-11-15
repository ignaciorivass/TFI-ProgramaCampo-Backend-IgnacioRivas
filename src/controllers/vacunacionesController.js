import pool from '../db.js';

const asegurarEstructura = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS vacuna (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      enfermedad VARCHAR(100) NULL
    )
  `);

  const [rowsVac] = await pool.query('SELECT COUNT(*) AS total FROM vacuna');
  if (rowsVac[0].total === 0) {
    await pool.query(`
      INSERT INTO vacuna (id, nombre, enfermedad) VALUES
      (1, 'Fiebre Aftosa - Biogénesis Bagó', 'Fiebre Aftosa'),
      (2, 'Brucelosis Cepa 19', 'Brucelosis Bovina'),
      (3, 'Carbunclo Bacteridiano', 'Carbunclo'),
      (4, 'Clostridiosis Polivalente', 'Mancha y Gangrena'),
      (5, 'Ivermectina Antiparasitaria', 'Parásitos internos y externos')
    `);
  }

  const [cols] = await pool.query('SHOW COLUMNS FROM vacunacion');
  const nombresCols = cols.map((c) => c.Field);
  const colFecha = nombresCols.includes('fecha_aplicacion') ? 'fecha_aplicacion' : 'fecha';

  return { colFecha };
};

export const getVacunas = async (req, res) => {
  try {
    await asegurarEstructura();
    const [rows] = await pool.query('SELECT * FROM vacuna ORDER BY id ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error en getVacunas:', error);
    res.status(500).json({ message: 'Error al obtener catálogo de vacunas', error: error.message });
  }
};

export const getVacunaciones = async (req, res) => {
  try {
    const { colFecha } = await asegurarEstructura();
    const [rows] = await pool.query(`
      SELECT 
        v.id,
        v.animal_id,
        v.vacuna_id,
        v.${colFecha} AS fecha_aplicacion,
        v.dosis,
        a.caravana,
        vac.nombre AS vacuna_nombre,
        vac.enfermedad
      FROM vacunacion v
      LEFT JOIN animal a ON v.animal_id = a.id
      LEFT JOIN vacuna vac ON v.vacuna_id = vac.id
      ORDER BY v.${colFecha} DESC, v.id DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error en getVacunaciones:', error);
    res.status(500).json({ message: 'Error al obtener vacunaciones', error: error.message });
  }
};

export const getVacunacionById = async (req, res) => {
  try {
    const { colFecha } = await asegurarEstructura();
    const [rows] = await pool.query(
      `SELECT id, animal_id, vacuna_id, ${colFecha} AS fecha_aplicacion, dosis FROM vacunacion WHERE id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Registro de vacunación no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error en getVacunacionById:', error);
    res.status(500).json({ message: 'Error al obtener vacunación', error: error.message });
  }
};

export const createVacunacion = async (req, res) => {
  const { animal_id, vacuna_id, fecha_aplicacion, dosis } = req.body;

  try {
    const { colFecha } = await asegurarEstructura();
    const [result] = await pool.query(
      `INSERT INTO vacunacion (animal_id, vacuna_id, ${colFecha}, dosis) VALUES (?, ?, ?, ?)`,
      [Number(animal_id), Number(vacuna_id), fecha_aplicacion, dosis]
    );
    res.status(201).json({ id: result.insertId, message: 'Vacunación registrada correctamente' });
  } catch (error) {
    console.error('Error en createVacunacion:', error);
    res.status(500).json({ message: 'Error al registrar vacunación', error: error.message });
  }
};

export const updateVacunacion = async (req, res) => {
  const { animal_id, vacuna_id, fecha_aplicacion, dosis } = req.body;

  try {
    const { colFecha } = await asegurarEstructura();
    await pool.query(
      `UPDATE vacunacion SET animal_id = ?, vacuna_id = ?, ${colFecha} = ?, dosis = ? WHERE id = ?`,
      [Number(animal_id), Number(vacuna_id), fecha_aplicacion, dosis, req.params.id]
    );
    res.json({ message: 'Vacunación actualizada correctamente' });
  } catch (error) {
    console.error('Error en updateVacunacion:', error);
    res.status(500).json({ message: 'Error al actualizar vacunación', error: error.message });
  }
};

export const deleteVacunacion = async (req, res) => {
  try {
    await pool.query('DELETE FROM vacunacion WHERE id = ?', [req.params.id]);
    res.json({ message: 'Vacunación eliminada correctamente' });
  } catch (error) {
    console.error('Error en deleteVacunacion:', error);
    res.status(500).json({ message: 'Error al eliminar vacunación', error: error.message });
  }
};
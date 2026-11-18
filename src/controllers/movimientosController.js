import pool from '../db.js';

// Mantiene el estado actual del animal alineado con el tipo de movimiento registrado.
const sincronizarAnimal = async (animalId, tipo, destinoPotreroId) => {
  if (tipo === 'Traslado') {
    await pool.query(
      "UPDATE animal SET potrero_id = ?, estado = 'Activo' WHERE id = ?",
      [destinoPotreroId || null, animalId]
    );
  } else if (tipo === 'Venta') {
    await pool.query(
      "UPDATE animal SET estado = 'Vendido', potrero_id = NULL WHERE id = ?",
      [animalId]
    );
  } else if (tipo === 'Baja') {
    await pool.query(
      "UPDATE animal SET estado = 'Muerto', potrero_id = NULL WHERE id = ?",
      [animalId]
    );
  }
};

// Lista movimientos con datos relacionados del animal y potreros de origen/destino.
export const getMovimientos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        m.*,
        a.caravana,
        po.nombre AS origen_nombre,
        pd.nombre AS destino_nombre
      FROM movimiento m
      LEFT JOIN animal a ON m.animal_id = a.id
      LEFT JOIN potrero po ON m.origen_potrero_id = po.id
      LEFT JOIN potrero pd ON m.destino_potrero_id = pd.id
      ORDER BY m.fecha DESC, m.id DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener movimientos', error: error.message });
  }
};

// Obtiene un movimiento individual usando su id.
export const getMovimientoById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM movimiento WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Movimiento no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener movimiento', error: error.message });
  }
};

// Registra el movimiento y luego actualiza el estado/potrero actual del animal.
export const createMovimiento = async (req, res) => {
  const { animal_id, fecha, tipo, motivo, origen_potrero_id, destino_potrero_id } = req.body;

  try {
    let origenFinal = origen_potrero_id || null;
    if (!origenFinal) {
      // Si no se informo el origen, se toma el potrero que el animal tiene actualmente.
      const [animal] = await pool.query('SELECT potrero_id FROM animal WHERE id = ?', [animal_id]);
      origenFinal = animal[0]?.potrero_id || null;
    }

    // Solo los traslados tienen potrero de destino.
    const destinoFinal = tipo === 'Traslado' ? destino_potrero_id || null : null;

    const [result] = await pool.query(
      `INSERT INTO movimiento (animal_id, fecha, tipo, motivo, origen_potrero_id, destino_potrero_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [animal_id, fecha, tipo, motivo || null, origenFinal, destinoFinal]
    );

    await sincronizarAnimal(animal_id, tipo, destinoFinal);

    res.status(201).json({ id: result.insertId, message: 'Movimiento registrado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar movimiento', error: error.message });
  }
};

// Edita el registro y vuelve a sincronizar el animal con los datos recibidos.
export const updateMovimiento = async (req, res) => {
  const { animal_id, fecha, tipo, motivo, origen_potrero_id, destino_potrero_id } = req.body;
  const destinoFinal = tipo === 'Traslado' ? destino_potrero_id || null : null;

  try {
    await pool.query(
      `UPDATE movimiento 
       SET animal_id = ?, fecha = ?, tipo = ?, motivo = ?, origen_potrero_id = ?, destino_potrero_id = ?
       WHERE id = ?`,
      [animal_id, fecha, tipo, motivo || null, origen_potrero_id || null, destinoFinal, req.params.id]
    );

    await sincronizarAnimal(animal_id, tipo, destinoFinal);

    res.json({ message: 'Movimiento actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar movimiento', error: error.message });
  }
};

// Antes de borrar el historial, devuelve el animal al potrero de origen registrado.
export const deleteMovimiento = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM movimiento WHERE id = ?', [req.params.id]);
    if (rows.length > 0) {
      await pool.query(
        "UPDATE animal SET estado = 'Activo', potrero_id = ? WHERE id = ?",
        [rows[0].origen_potrero_id || null, rows[0].animal_id]
      );
    }

    await pool.query('DELETE FROM movimiento WHERE id = ?', [req.params.id]);
    res.json({ message: 'Movimiento eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar movimiento', error: error.message });
  }
};
import pool from '../db.js';

// Devuelve animales junto con el nombre del potrero; LEFT JOIN conserva animales sin potrero.
export const getAnimales = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.*, p.nombre AS potrero_nombre
      FROM animal a
      LEFT JOIN potrero p ON a.potrero_id = p.id
      ORDER BY a.id DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error en getAnimales:', error);
    res.status(500).json({ message: 'Error al obtener animales', error: error.message });
  }
};

// Busca por la clave primaria y responde 404 cuando no existe ese animal.
export const getAnimalById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM animal WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Animal no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error en getAnimalById:', error);
    res.status(500).json({ message: 'Error al obtener el animal', error: error.message });
  }
};

// Crea un animal; algunos campos opcionales reciben valores iniciales o NULL.
export const createAnimal = async (req, res) => {
  const {
    caravana,
    especie,
    raza,
    sexo,
    origen,
    fecha_nacimiento,
    potrero_id,
    peso,
    estado,
    madre_id,
    padre_id,
  } = req.body;

  try {
    // Los placeholders ? mantienen los valores del cuerpo fuera del texto SQL.
    const [result] = await pool.query(
      `INSERT INTO animal 
        (caravana, especie, raza, sexo, origen, fecha_nacimiento, potrero_id, peso, estado, madre_id, padre_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        caravana,
        especie,
        raza,
        sexo,
        origen || 'Compra',
        fecha_nacimiento,
        potrero_id || null,
        peso,
        estado || 'Activo',
        madre_id || null,
        padre_id || null,
      ]
    );
    res.status(201).json({ id: result.insertId, message: 'Animal registrado correctamente' });
  } catch (error) {
    console.error('Error en createAnimal:', error);
    res.status(500).json({ message: 'Error al registrar el animal', error: error.message });
  }
};

// Reemplaza los datos editables del animal indicado por el parametro :id.
export const updateAnimal = async (req, res) => {
  const {
    caravana,
    especie,
    raza,
    sexo,
    origen,
    fecha_nacimiento,
    potrero_id,
    peso,
    estado,
    madre_id,
    padre_id,
  } = req.body;

  try {
    await pool.query(
      `UPDATE animal 
       SET caravana = ?, especie = ?, raza = ?, sexo = ?, origen = ?, 
           fecha_nacimiento = ?, potrero_id = ?, peso = ?, estado = ?, 
           madre_id = ?, padre_id = ?
       WHERE id = ?`,
      [
        caravana,
        especie,
        raza,
        sexo,
        origen || 'Compra',
        fecha_nacimiento,
        potrero_id || null,
        peso,
        estado || 'Activo',
        madre_id || null,
        padre_id || null,
        req.params.id,
      ]
    );
    res.json({ message: 'Animal actualizado correctamente' });
  } catch (error) {
    console.error('Error en updateAnimal:', error);
    res.status(500).json({ message: 'Error al actualizar el animal', error: error.message });
  }
};

// Las claves foraneas pueden impedir borrar animales que aun tienen historial asociado.
export const deleteAnimal = async (req, res) => {
  try {
    await pool.query('DELETE FROM animal WHERE id = ?', [req.params.id]);
    res.json({ message: 'Animal eliminado correctamente' });
  } catch (error) {
    console.error('Error en deleteAnimal:', error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        message: 'No se puede eliminar el animal porque tiene movimientos, vacunaciones, pesajes o crías asociadas.',
      });
    }
    res.status(500).json({ message: 'Error al eliminar el animal', error: error.message });
  }
};

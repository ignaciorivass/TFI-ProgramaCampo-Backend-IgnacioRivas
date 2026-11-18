import pool from '../db.js';

export const getUsuarios = async (_req, res) => {
  try {
    const [usuarios] = await pool.query(
      'SELECT id, nombre, email, rol FROM usuario ORDER BY nombre, email'
    );
    res.json(usuarios);
  } catch (error) {
    console.error('Error en getUsuarios:', error);
    res.status(500).json({ message: 'Error al obtener los usuarios' });
  }
};

export const deleteUsuario = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    return res.status(400).json({ message: 'Identificador de usuario inválido' });
  }
  if (Number(req.user?.id) === id) {
    return res.status(400).json({ message: 'No podés eliminar tu propia cuenta' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [usuarios] = await connection.query(
      'SELECT id, rol FROM usuario WHERE id = ? FOR UPDATE',
      [id]
    );
    if (usuarios.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (usuarios[0].rol === 'Administrador') {
      const [administradores] = await connection.query(
        'SELECT id FROM usuario WHERE rol = ? FOR UPDATE',
        ['Administrador']
      );
      if (administradores.length <= 1) {
        await connection.rollback();
        return res.status(409).json({ message: 'No se puede eliminar al último administrador' });
      }
    }

    await connection.query('DELETE FROM usuario WHERE id = ?', [id]);
    await connection.commit();
    return res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Error al cancelar la eliminación del usuario:', rollbackError);
      }
    }
    console.error('Error en deleteUsuario:', error);
    return res.status(500).json({ message: 'Error al eliminar el usuario' });
  } finally {
    if (connection) connection.release();
  }
};

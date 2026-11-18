import pool from '../db.js';

// Nombres cortos de los meses para las etiquetas de los gráficos.
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// Devuelve los últimos "cantidad" meses (incluido el actual) como { clave: '2026-11', mes: 'Nov' }.
const ultimosMeses = (cantidad) => {
  const hoy = new Date();
  const lista = [];
  for (let i = cantidad - 1; i >= 0; i--) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    const clave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    lista.push({ clave, mes: MESES[d.getMonth()] });
  }
  return lista;
};

// Tarjetas del dashboard. El administrador recibe además la cantidad de usuarios.
export const getResumen = async (req, res) => {
  try {
    const [[animales]] = await pool.query(
      `SELECT COUNT(*) AS activos, COALESCE(AVG(peso), 0) AS peso_promedio
       FROM animal WHERE estado = 'Activo'`
    );
    const [[nacimientos]] = await pool.query(
      `SELECT COUNT(*) AS total FROM animal
       WHERE origen = 'Nacimiento'
         AND YEAR(fecha_nacimiento) = YEAR(CURDATE())
         AND MONTH(fecha_nacimiento) = MONTH(CURDATE())`
    );
    const [[vacunaciones]] = await pool.query(
      `SELECT COUNT(*) AS total FROM vacunacion
       WHERE YEAR(fecha_aplicacion) = YEAR(CURDATE())
         AND MONTH(fecha_aplicacion) = MONTH(CURDATE())`
    );
    const [[potreros]] = await pool.query(
      `SELECT COUNT(*) AS total, COALESCE(SUM(capacidad), 0) AS capacidad FROM potrero`
    );
    const [[ubicados]] = await pool.query(
      `SELECT COUNT(*) AS total FROM animal WHERE estado = 'Activo' AND potrero_id IS NOT NULL`
    );

    const capacidad = Number(potreros.capacidad);
    const resumen = {
      animales_activos: Number(animales.activos),
      peso_promedio: Math.round(Number(animales.peso_promedio) * 10) / 10,
      nacimientos_mes: Number(nacimientos.total),
      vacunaciones_mes: Number(vacunaciones.total),
      total_potreros: Number(potreros.total),
      ocupacion_pct: capacidad > 0 ? Math.round((Number(ubicados.total) / capacidad) * 100) : 0,
    };

    // Dato extra solo para el administrador (el frontend y el backend coinciden en esto).
    if (req.user.rol === 'Administrador') {
      const [[usuarios]] = await pool.query('SELECT COUNT(*) AS total FROM usuario');
      const [[bajas]] = await pool.query(
        `SELECT COUNT(*) AS total FROM movimiento
         WHERE tipo IN ('Venta', 'Baja')
           AND YEAR(fecha) = YEAR(CURDATE()) AND MONTH(fecha) = MONTH(CURDATE())`
      );
      resumen.usuarios = Number(usuarios.total);
      resumen.ventas_bajas_mes = Number(bajas.total);
    }

    res.json(resumen);
  } catch (error) {
    console.error('Error en getResumen:', error);
    res.status(500).json({ message: 'Error al obtener el resumen', error: error.message });
  }
};

// Nacimientos de los últimos 6 meses; los meses sin nacimientos se completan con 0.
export const getNacimientosPorMes = async (req, res) => {
  try {
    const meses = ultimosMeses(6);
    const [rows] = await pool.query(
      `SELECT DATE_FORMAT(fecha_nacimiento, '%Y-%m') AS clave, COUNT(*) AS cantidad
       FROM animal
       WHERE origen = 'Nacimiento' AND fecha_nacimiento >= ?
       GROUP BY clave`,
      [`${meses[0].clave}-01`]
    );
    const porClave = Object.fromEntries(rows.map((r) => [r.clave, Number(r.cantidad)]));
    res.json(meses.map((m) => ({ mes: m.mes, cantidad: porClave[m.clave] || 0 })));
  } catch (error) {
    console.error('Error en getNacimientosPorMes:', error);
    res.status(500).json({ message: 'Error al obtener los nacimientos', error: error.message });
  }
};

// Animales activos agrupados por potrero (los que no tienen potrero van aparte).
export const getAnimalesPorPotrero = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT COALESCE(p.nombre, 'Sin potrero') AS nombre, COUNT(a.id) AS cantidad
       FROM animal a
       LEFT JOIN potrero p ON a.potrero_id = p.id
       WHERE a.estado = 'Activo'
       GROUP BY p.id, p.nombre
       ORDER BY cantidad DESC`
    );
    res.json(rows.map((r) => ({ nombre: r.nombre, cantidad: Number(r.cantidad) })));
  } catch (error) {
    console.error('Error en getAnimalesPorPotrero:', error);
    res.status(500).json({ message: 'Error al obtener animales por potrero', error: error.message });
  }
};

// Distribución del rodeo activo por raza.
export const getAnimalesPorRaza = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT CASE WHEN raza = '' THEN 'Sin raza' ELSE raza END AS nombre, COUNT(*) AS cantidad
       FROM animal
       WHERE estado = 'Activo'
       GROUP BY nombre
       ORDER BY cantidad DESC`
    );
    res.json(rows.map((r) => ({ nombre: r.nombre, cantidad: Number(r.cantidad) })));
  } catch (error) {
    console.error('Error en getAnimalesPorRaza:', error);
    res.status(500).json({ message: 'Error al obtener animales por raza', error: error.message });
  }
};

// Cantidad de aplicaciones por enfermedad (muestra la enfermedad y no el nombre comercial, que es largo).
export const getVacunacionesPorVacuna = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT COALESCE(v.enfermedad, v.nombre) AS nombre, COUNT(vc.id) AS cantidad
       FROM vacunacion vc
       JOIN vacuna v ON vc.vacuna_id = v.id
       GROUP BY v.id, v.enfermedad, v.nombre
       ORDER BY cantidad DESC`
    );
    res.json(rows.map((r) => ({ nombre: r.nombre, cantidad: Number(r.cantidad) })));
  } catch (error) {
    console.error('Error en getVacunacionesPorVacuna:', error);
    res.status(500).json({ message: 'Error al obtener las vacunaciones', error: error.message });
  }
};

// Los últimos animales registrados, para la tabla del dashboard.
export const getUltimosAnimales = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.id, a.caravana, a.raza, a.sexo, a.origen, a.estado, p.nombre AS potrero_nombre
       FROM animal a
       LEFT JOIN potrero p ON a.potrero_id = p.id
       ORDER BY a.id DESC
       LIMIT 5`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error en getUltimosAnimales:', error);
    res.status(500).json({ message: 'Error al obtener los últimos animales', error: error.message });
  }
};

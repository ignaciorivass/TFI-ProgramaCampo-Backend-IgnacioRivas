import pool from '../db.js';

const normalizar = (texto = '') =>
  texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const formatoNumero = (valor) =>
  new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(Number(valor) || 0);

export const consultarChatbot = async (req, res) => {
  const mensaje = String(req.body?.mensaje || '').trim();

  if (!mensaje) {
    return res.status(400).json({ message: 'Escribí una consulta.' });
  }

  const texto = normalizar(mensaje);

  try {
    if (/hola|buenas|buen dia|buenos dias|hey/.test(texto)) {
      return res.json({
        respuesta: '¡Hola! Puedo ayudarte a consultar el rodeo, potreros, movimientos, vacunaciones y pesajes. Probá con "resumen", "animales activos" o "estado de la caravana 123".',
      });
    }

    if (/ayuda|como uso|que puedo|opciones|comandos/.test(texto)) {
      return res.json({
        respuesta: 'Consultas disponibles:\n• resumen del establecimiento\n• animales activos o vendidos\n• potreros y ocupación\n• movimientos recientes\n• vacunaciones recientes\n• pesajes recientes\n• datos de una caravana',
      });
    }

    if (/resumen|totales|como viene|estado general|panorama/.test(texto)) {
      const [[animales]] = await pool.query(
        "SELECT COUNT(*) AS activos, COALESCE(AVG(peso), 0) AS peso FROM animal WHERE estado = 'Activo'"
      );
      const [[potreros]] = await pool.query(
        'SELECT COUNT(*) AS cantidad, COALESCE(SUM(capacidad), 0) AS capacidad FROM potrero'
      );
      const [[ubicados]] = await pool.query(
        "SELECT COUNT(*) AS cantidad FROM animal WHERE estado = 'Activo' AND potrero_id IS NOT NULL"
      );
      const [[vacunasMes]] = await pool.query(
        'SELECT COUNT(*) AS cantidad FROM vacunacion WHERE YEAR(fecha_aplicacion) = YEAR(CURDATE()) AND MONTH(fecha_aplicacion) = MONTH(CURDATE())'
      );

      const capacidad = Number(potreros.capacidad);
      const ocupacion = capacidad > 0
        ? Math.round((Number(ubicados.cantidad) / capacidad) * 100)
        : 0;

      return res.json({
        respuesta: `Resumen actual:\n• Animales activos: ${formatoNumero(animales.activos)}\n• Peso promedio: ${formatoNumero(animales.peso)} kg\n• Potreros: ${formatoNumero(potreros.cantidad)}\n• Ocupación estimada: ${ocupacion}%\n• Vacunaciones aplicadas este mes: ${formatoNumero(vacunasMes.cantidad)}`,
      });
    }

    if (/potrero|potreros|ocupacion|ocupados|capacidad/.test(texto)) {
      const [rows] = await pool.query(`
        SELECT p.nombre, p.superficie, p.capacidad,
          COUNT(CASE WHEN a.estado = 'Activo' THEN 1 END) AS ocupados
        FROM potrero p
        LEFT JOIN animal a ON a.potrero_id = p.id
        GROUP BY p.id, p.nombre, p.superficie, p.capacidad
        ORDER BY ocupados DESC
      `);

      if (rows.length === 0) {
        return res.json({ respuesta: 'Todavía no hay potreros registrados.' });
      }

      const detalle = rows
        .slice(0, 8)
        .map((p) => `• ${p.nombre}: ${p.ocupados}/${p.capacidad} animales (${formatoNumero(p.superficie)} ha)`)
        .join('\n');

      return res.json({
        respuesta: `Estado de los potreros:\n${detalle}`,
      });
    }

    if (/movimiento|traslado|venta|baja/.test(texto)) {
      const [rows] = await pool.query(`
        SELECT m.fecha, m.tipo, m.motivo, a.caravana,
          po.nombre AS origen, pd.nombre AS destino
        FROM movimiento m
        LEFT JOIN animal a ON m.animal_id = a.id
        LEFT JOIN potrero po ON m.origen_potrero_id = po.id
        LEFT JOIN potrero pd ON m.destino_potrero_id = pd.id
        ORDER BY m.fecha DESC, m.id DESC
        LIMIT 8
      `);

      if (rows.length === 0) {
        return res.json({ respuesta: 'Todavía no hay movimientos registrados.' });
      }

      const detalle = rows.map((m) => {
        const ruta = m.tipo === 'Traslado'
          ? `, de ${m.origen || 'origen no informado'} a ${m.destino || 'destino no informado'}`
          : '';
        return `• ${m.fecha.toISOString().slice(0, 10)}: ${m.tipo} — caravana ${m.caravana || 'desconocida'}${ruta}`;
      }).join('\n');

      return res.json({ respuesta: `Últimos movimientos:\n${detalle}` });
    }

    if (/vacuna|vacunacion|vacunaciones|sanidad/.test(texto)) {
      const [rows] = await pool.query(`
        SELECT v.fecha_aplicacion, v.dosis, a.caravana,
          COALESCE(vc.enfermedad, vc.nombre) AS vacuna
        FROM vacunacion v
        LEFT JOIN animal a ON v.animal_id = a.id
        LEFT JOIN vacuna vc ON v.vacuna_id = vc.id
        ORDER BY v.fecha_aplicacion DESC, v.id DESC
        LIMIT 8
      `);

      if (rows.length === 0) {
        return res.json({ respuesta: 'Todavía no hay vacunaciones registradas.' });
      }

      const detalle = rows.map((v) =>
        `• ${v.fecha_aplicacion.toISOString().slice(0, 10)}: ${v.vacuna || 'Vacuna'} — caravana ${v.caravana || 'desconocida'} (${v.dosis})`
      ).join('\n');

      return res.json({ respuesta: `Últimas vacunaciones:\n${detalle}` });
    }

    if (/pesaje|pesajes|peso reciente|pesada/.test(texto)) {
      const [rows] = await pool.query(`
        SELECT p.fecha, p.peso, p.observaciones, a.caravana
        FROM pesaje p
        JOIN animal a ON p.animal_id = a.id
        ORDER BY p.fecha DESC, p.id DESC
        LIMIT 8
      `);

      if (rows.length === 0) {
        return res.json({ respuesta: 'Todavía no hay pesajes registrados.' });
      }

      const detalle = rows.map((p) =>
        `• ${p.fecha.toISOString().slice(0, 10)}: caravana ${p.caravana} — ${formatoNumero(p.peso)} kg`
      ).join('\n');

      return res.json({ respuesta: `Últimos pesajes:\n${detalle}` });
    }

    if (/animal|caravana|rodeo|activo|vendido|muerto/.test(texto)) {
      const coincidencia = texto.match(/(?:caravana|animal|nro\.?|numero)\s*[#:]?\s*([a-z0-9-]+)/);
      const posiblesPalabras = new Set(['el', 'la', 'los', 'las', 'un', 'una', 'es', 'esta', 'activo', 'activos', 'vendido', 'vendidos']);
      if (coincidencia && !posiblesPalabras.has(coincidencia[1]) && coincidencia[1].length >= 2) {
        const caravana = coincidencia[1];
        const [rows] = await pool.query(`
          SELECT a.*, p.nombre AS potrero_nombre
          FROM animal a
          LEFT JOIN potrero p ON a.potrero_id = p.id
          WHERE LOWER(a.caravana) = LOWER(?)
          LIMIT 1
        `, [caravana]);

        if (rows.length === 0) {
          return res.json({ respuesta: `No encontré ningún animal con caravana "${caravana}".` });
        }

        const a = rows[0];
        return res.json({
          respuesta: `Animal ${a.caravana}:\n• Estado: ${a.estado}\n• Especie/raza: ${a.especie || '-'} / ${a.raza || '-'}\n• Sexo: ${a.sexo}\n• Peso actual: ${formatoNumero(a.peso)} kg\n• Potrero: ${a.potrero_nombre || 'Sin potrero'}\n• Origen: ${a.origen}`,
        });
      }

      const [[activos]] = await pool.query("SELECT COUNT(*) AS cantidad FROM animal WHERE estado = 'Activo'");
      const [[vendidos]] = await pool.query("SELECT COUNT(*) AS cantidad FROM animal WHERE estado = 'Vendido'");
      const [[muertos]] = await pool.query("SELECT COUNT(*) AS cantidad FROM animal WHERE estado = 'Muerto'");
      return res.json({
        respuesta: `Estado del rodeo:\n• Activos: ${formatoNumero(activos.cantidad)}\n• Vendidos: ${formatoNumero(vendidos.cantidad)}\n• Bajados/Muertos: ${formatoNumero(muertos.cantidad)}`,
      });
    }

    return res.json({
      respuesta: 'No encontré una consulta reconocida. Probá con "resumen", "potreros", "movimientos recientes", "vacunaciones" o "datos de la caravana 123".',
    });
  } catch (error) {
    console.error('Error en chatbot:', error);
    return res.status(500).json({
      message: 'No pude consultar la información en este momento.',
    });
  }
};

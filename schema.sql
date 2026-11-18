-- ============================================================================
-- ESQUEMA ACTUAL - SISTEMA GANADERO (TFI PCampo)
-- ============================================================================
-- Este archivo es seguro para ejecutar sobre una base ya creada:
-- no elimina la base, las tablas ni los datos existentes.
--
-- Uso:
--   mysql -u root -p < schema.sql
-- ============================================================================

CREATE DATABASE IF NOT EXISTS sistema_ganadero
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sistema_ganadero;

-- 1. Usuarios
CREATE TABLE IF NOT EXISTS usuario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  contraseña VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'Peón',
  UNIQUE KEY uq_usuario_email (email)
) ENGINE=InnoDB;

-- 2. Potreros
CREATE TABLE IF NOT EXISTS potrero (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  superficie DECIMAL(10,2) NOT NULL,
  capacidad INT NOT NULL
) ENGINE=InnoDB;

-- 3. Animales
-- especie y raza se almacenan directamente porque el frontend las administra
-- como campos independientes.
CREATE TABLE IF NOT EXISTS animal (
  id INT AUTO_INCREMENT PRIMARY KEY,
  caravana VARCHAR(50) NOT NULL,
  especie VARCHAR(50) NOT NULL DEFAULT 'Bovino',
  raza VARCHAR(50) NOT NULL DEFAULT '',
  sexo ENUM('Macho', 'Hembra') NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  peso DECIMAL(8,2) NOT NULL,
  origen VARCHAR(20) NOT NULL DEFAULT 'Compra',
  estado VARCHAR(20) NOT NULL DEFAULT 'Activo',
  potrero_id INT NULL,
  madre_id INT NULL,
  padre_id INT NULL,
  UNIQUE KEY uq_animal_caravana (caravana),
  CONSTRAINT fk_animal_potrero
    FOREIGN KEY (potrero_id) REFERENCES potrero(id) ON DELETE SET NULL,
  CONSTRAINT fk_animal_madre
    FOREIGN KEY (madre_id) REFERENCES animal(id) ON DELETE SET NULL,
  CONSTRAINT fk_animal_padre
    FOREIGN KEY (padre_id) REFERENCES animal(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 4. Catálogo de vacunas
CREATE TABLE IF NOT EXISTS vacuna (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  enfermedad VARCHAR(100) NULL
) ENGINE=InnoDB;

-- 5. Aplicaciones de vacunas
-- La dosis se conserva como texto normalizado (ej.: "2 ml", "5 cc", "1 dosis").
CREATE TABLE IF NOT EXISTS vacunacion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  animal_id INT NOT NULL,
  vacuna_id INT NOT NULL,
  fecha_aplicacion DATE NOT NULL,
  dosis VARCHAR(50) NOT NULL,
  CONSTRAINT fk_vacunacion_animal
    FOREIGN KEY (animal_id) REFERENCES animal(id),
  CONSTRAINT fk_vacunacion_vacuna
    FOREIGN KEY (vacuna_id) REFERENCES vacuna(id)
) ENGINE=InnoDB;

-- 6. Movimientos
CREATE TABLE IF NOT EXISTS movimiento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  animal_id INT NOT NULL,
  fecha DATE NOT NULL,
  tipo ENUM('Traslado', 'Venta', 'Baja') NOT NULL,
  motivo VARCHAR(255) NULL,
  origen_potrero_id INT NULL,
  destino_potrero_id INT NULL,
  CONSTRAINT fk_movimiento_animal
    FOREIGN KEY (animal_id) REFERENCES animal(id),
  CONSTRAINT fk_movimiento_origen
    FOREIGN KEY (origen_potrero_id) REFERENCES potrero(id) ON DELETE SET NULL,
  CONSTRAINT fk_movimiento_destino
    FOREIGN KEY (destino_potrero_id) REFERENCES potrero(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 7. Pesajes
CREATE TABLE IF NOT EXISTS pesaje (
  id INT AUTO_INCREMENT PRIMARY KEY,
  animal_id INT NOT NULL,
  fecha DATE NOT NULL,
  peso DECIMAL(6,2) NOT NULL,
  observaciones VARCHAR(255) NULL,
  CONSTRAINT fk_pesaje_animal
    FOREIGN KEY (animal_id) REFERENCES animal(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- DATOS INICIALES NO DESTRUCTIVOS
-- Solo se agregan si no existen, sin actualizar ni borrar registros cargados.
-- ============================================================================

INSERT IGNORE INTO vacuna (id, nombre, enfermedad) VALUES
  (1, 'Fiebre Aftosa - Biogénesis Bagó', 'Fiebre Aftosa'),
  (2, 'Brucelosis Cepa 19', 'Brucelosis Bovina'),
  (3, 'Carbunclo Bacteridiano', 'Carbunclo'),
  (4, 'Clostridiosis Polivalente', 'Mancha y Gangrena'),
  (5, 'Ivermectina Antiparasitaria', 'Parásitos internos y externos');

-- ============================================================================
-- MIGRACIÓN COMPATIBLE DE UNA INSTALACIÓN EXISTENTE
-- ============================================================================
-- Copia los datos de la estructura anterior antes de quitar su columna duplicada.
-- Las fechas vacías conservan el valor de fecha_aplicacion.

SET @tiene_fecha_vacunacion = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'sistema_ganadero'
    AND TABLE_NAME = 'vacunacion'
    AND COLUMN_NAME = 'fecha'
);

SET @tiene_fecha_aplicacion = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'sistema_ganadero'
    AND TABLE_NAME = 'vacunacion'
    AND COLUMN_NAME = 'fecha_aplicacion'
);

SET @sql = IF(
  @tiene_fecha_vacunacion > 0 AND @tiene_fecha_aplicacion > 0,
  'UPDATE vacunacion SET fecha_aplicacion = COALESCE(fecha_aplicacion, fecha) WHERE fecha_aplicacion IS NULL',
  'SELECT 1'
);
PREPARE sentencia FROM @sql;
EXECUTE sentencia;
DEALLOCATE PREPARE sentencia;

SET @sql = IF(
  @tiene_fecha_vacunacion > 0,
  'ALTER TABLE vacunacion DROP COLUMN fecha',
  'SELECT 1'
);
PREPARE sentencia FROM @sql;
EXECUTE sentencia;
DEALLOCATE PREPARE sentencia;

-- Convierte la dosis anterior DECIMAL o la deja como texto si ya es VARCHAR.
ALTER TABLE vacunacion
  MODIFY COLUMN dosis VARCHAR(50) NOT NULL;

-- Roles admitidos por el sistema actual.
ALTER TABLE usuario
  MODIFY COLUMN rol VARCHAR(20) NOT NULL DEFAULT 'Peón';

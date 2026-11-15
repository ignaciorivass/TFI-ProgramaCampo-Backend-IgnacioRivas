-- ============================================================================
-- BASE DE DATOS COMPLETA - SISTEMA GANADERO (TFI PCampo)
-- ============================================================================

DROP DATABASE IF EXISTS sistema_ganadero;
CREATE DATABASE sistema_ganadero CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sistema_ganadero;

-- 1. Tabla de Usuarios y Roles
CREATE TABLE usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    contraseña VARCHAR(255) NOT NULL,
    rol ENUM('Administrador', 'Peón', 'Veterinario') NOT NULL DEFAULT 'Peón'
);

-- 2. Tabla de Potreros
CREATE TABLE potrero (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    superficie DECIMAL(10,2) NOT NULL,
    capacidad INT NOT NULL
);

-- 3. Tabla Principal de Animales (con origen y relación reflexiva madre/padre)
CREATE TABLE animal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    caravana VARCHAR(50) UNIQUE NOT NULL,
    especie VARCHAR(50) NOT NULL DEFAULT 'Bovino',
    raza VARCHAR(50) NOT NULL DEFAULT '',
    sexo ENUM('Macho', 'Hembra') NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    peso DECIMAL(8,2) NOT NULL,
    origen VARCHAR(20) NOT NULL DEFAULT 'Compra',
    estado VARCHAR(20) NOT NULL DEFAULT 'Activo',
    observaciones TEXT NULL,
    potrero_id INT NULL,
    madre_id INT NULL,
    padre_id INT NULL,
    CONSTRAINT fk_animal_potrero FOREIGN KEY (potrero_id) REFERENCES potrero(id) ON DELETE SET NULL,
    CONSTRAINT fk_animal_madre FOREIGN KEY (madre_id) REFERENCES animal(id) ON DELETE SET NULL,
    CONSTRAINT fk_animal_padre FOREIGN KEY (padre_id) REFERENCES animal(id) ON DELETE SET NULL
);

-- 4. Catálogo de Vacunas
CREATE TABLE vacuna (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    enfermedad VARCHAR(100) NULL
);

-- 5. Historial Sanitario (Vacunaciones aplicadas)
CREATE TABLE vacunacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    animal_id INT NOT NULL,
    vacuna_id INT NOT NULL,
    fecha_aplicacion DATE NOT NULL,
    dosis VARCHAR(50) NOT NULL,
    CONSTRAINT fk_vacunacion_animal FOREIGN KEY (animal_id) REFERENCES animal(id),
    CONSTRAINT fk_vacunacion_vacuna FOREIGN KEY (vacuna_id) REFERENCES vacuna(id)
);

-- 6. Historial de Movimientos (Traslados, Ventas y Bajas)
CREATE TABLE movimiento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    animal_id INT NOT NULL,
    fecha DATE NOT NULL,
    tipo ENUM('Traslado', 'Venta', 'Baja') NOT NULL,
    motivo VARCHAR(255) NULL,
    origen_potrero_id INT NULL,
    destino_potrero_id INT NULL,
    motivo VARCHAR(255) NULL,
    CONSTRAINT fk_movimiento_animal FOREIGN KEY (animal_id) REFERENCES animal(id),
    CONSTRAINT fk_movimiento_origen FOREIGN KEY (origen_potrero_id) REFERENCES potrero(id) ON DELETE SET NULL,
    CONSTRAINT fk_movimiento_destino FOREIGN KEY (destino_potrero_id) REFERENCES potrero(id) ON DELETE SET NULL
);

-- 7. Historial de Pesajes
CREATE TABLE pesaje (
    id INT AUTO_INCREMENT PRIMARY KEY,
    animal_id INT NOT NULL,
    fecha DATE NOT NULL,
    peso DECIMAL(6,2) NOT NULL,
    observaciones VARCHAR(255) NULL,
    CONSTRAINT fk_pesaje_animal FOREIGN KEY (animal_id) REFERENCES animal(id) ON DELETE CASCADE
);

-- ============================================================================
-- DATOS INICIALES DE PRUEBA (Para que el sistema arranque listo para usar)
-- ============================================================================

INSERT INTO potrero (nombre, superficie, capacidad) VALUES
('Potrero Norte 1', 45.50, 80),
('Potrero Sur 2', 30.00, 50),
('Corral de Engorde', 10.00, 35);

INSERT INTO vacuna (nombre, enfermedad) VALUES
('Fiebre Aftosa - Biogénesis Bagó', 'Fiebre Aftosa'),
('Brucelosis Cepa 19', 'Brucelosis Bovina'),
('Carbunclo Bacteridiano', 'Carbunclo'),
('Clostridiosis Polivalente', 'Mancha y Gangrena'),
('Ivermectina Antiparasitaria', 'Parásitos internos y externos');

INSERT INTO animal (caravana, especie, raza, sexo, fecha_nacimiento, peso, origen, estado, potrero_id, madre_id, padre_id) VALUES
('AR-101', 'Bovino', 'Brangus', 'Hembra', '2023-05-10', 420.50, 'Compra', 'Activo', 1, NULL, NULL),
('AR-201', 'Bovino', 'Aberdeen Angus', 'Macho', '2022-08-15', 580.00, 'Compra', 'Activo', 1, NULL, NULL),
('AR-301', 'Bovino', 'Brangus', 'Macho', '2026-09-20', 95.00, 'Nacimiento', 'Activo', 2, 1, 2);

INSERT INTO pesaje (animal_id, fecha, peso, observaciones) VALUES
(1, '2026-10-01', 410.00, 'Control sanitario primavera'),
(1, '2026-11-01', 420.50, 'Buena ganancia de peso'),
(3, '2026-11-01', 95.00, 'Control post-nacimiento');
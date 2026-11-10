
CREATE DATABASE IF NOT EXISTS sistema_ganadero;
USE sistema_ganadero;


CREATE TABLE Usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    contraseña VARCHAR(255) NOT NULL,
    rol ENUM('Administrador', 'Peón', 'Veterinario') NOT NULL
);


CREATE TABLE Potrero (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    superficie DECIMAL(10,2) NOT NULL, -- Hectáreas
    capacidad INT NOT NULL -- Cantidad máxima de animales
);


CREATE TABLE Especie_Raza (
    id INT AUTO_INCREMENT PRIMARY KEY,
    especie VARCHAR(50) NOT NULL,
    nombre_raza VARCHAR(100) NOT NULL
);


CREATE TABLE Animal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    caravana VARCHAR(50) UNIQUE NOT NULL,
    sexo ENUM('Macho', 'Hembra') NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    peso DECIMAL(8,2) NOT NULL,
    estado ENUM('Activo', 'Vendido', 'Muerto') DEFAULT 'Activo',
    observaciones TEXT,
    potrero_id INT,
    especie_raza_id INT,
    madre_id INT NULL,
    padre_id INT NULL,
    CONSTRAINT fk_animal_potrero FOREIGN KEY (potrero_id) REFERENCES Potrero(id),
    CONSTRAINT fk_animal_raza FOREIGN KEY (especie_raza_id) REFERENCES Especie_Raza(id),
    CONSTRAINT fk_animal_madre FOREIGN KEY (madre_id) REFERENCES Animal(id),
    CONSTRAINT fk_animal_padre FOREIGN KEY (padre_id) REFERENCES Animal(id)
);

CREATE TABLE Nacimiento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    cantidad_crias INT NOT NULL,
    tipo_parto VARCHAR(50) NOT NULL,
    madre_id INT NOT NULL,
    CONSTRAINT fk_nacimiento_madre FOREIGN KEY (madre_id) REFERENCES Animal(id)
);


CREATE TABLE Vacuna (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    enfermedad VARCHAR(100) NOT NULL
);


CREATE TABLE Vacunacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    animal_id INT NOT NULL,
    vacuna_id INT NOT NULL,
    fecha_aplicacion DATE NOT NULL,
    dosis VARCHAR(50) NOT NULL,
    CONSTRAINT fk_vacunacion_animal FOREIGN KEY (animal_id) REFERENCES Animal(id),
    CONSTRAINT fk_vacunacion_vacuna FOREIGN KEY (vacuna_id) REFERENCES Vacuna(id)
);


CREATE TABLE Movimiento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    animal_id INT NOT NULL,
    fecha DATE NOT NULL,
    tipo ENUM('Traslado', 'Venta', 'Baja') NOT NULL,
    motivo VARCHAR(255) NOT NULL,
    origen_potrero_id INT NULL,
    destino_potrero_id INT NULL,
    CONSTRAINT fk_movimiento_animal FOREIGN KEY (animal_id) REFERENCES Animal(id),
    CONSTRAINT fk_movimiento_origen FOREIGN KEY (origen_potrero_id) REFERENCES Potrero(id),
    CONSTRAINT fk_movimiento_destino FOREIGN KEY (destino_potrero_id) REFERENCES Potrero(id)
);
# ⚙️ TFI - Sistema Ganadero (Backend)

Este repositorio contiene la API RESTful (Backend) del **Sistema de Gestión Ganadera (TFI - PCampo)**. Proporciona la lógica de negocio, acceso seguro a la base de datos MySQL, autenticación JWT, encintado de contraseñas y validación de permisos por roles para la gestión integral del establecimiento ganadero.

## 👨‍💻 Integrantes

* **Ignacio Rivas**
* **Gonzalez Benjamin**

## 🛠️ Tecnologías Utilizadas

* [**Node.js**](https://nodejs.org/) - Entorno de ejecución para JavaScript en el servidor.
* [**Express.js**](https://expressjs.com/) - Framework web minimalista para la creación de la API REST.
* [**MySQL**](https://www.mysql.com/) - Sistema de gestión de bases de datos relacional.
* [**jsonwebtoken (JWT)**](https://jwt.io/) - Manejo de autenticación basada en tokens seguros.
* [**bcryptjs**](https://www.npmjs.com/package/bcryptjs) - Hashing de contraseñas para seguridad de usuarios.
* [**CORS**](https://www.npmjs.com/package/cors) - Middleware para permitir peticiones desde el cliente React.

## 📋 Requisitos Previos

Antes de ejecutar el servidor backend, asegúrate de contar con:

* **Node.js** (Versión 18.x o superior)
* **MySQL Server** (Versión 8.0 o superior) corriendo localmente en el puerto `3306`.
* Herramienta de gestión de MySQL como **MySQL Workbench** o **phpMyAdmin**.

## 🗄️ Configuración de la Base de Datos

1. Abre tu cliente MySQL (ej. MySQL Workbench) y crea la base de datos `sistema_ganadero`.
2. Asegúrate de tener creadas las tablas relacionales: `usuario`, `animal`, `potrero`, `movimiento`, `vacuna`, `vacunacion` y `especie_raza`.
3. Inserta los datos iniciales obligatorios para el catálogo de vacunas ejecutando:

```sql
USE sistema_ganadero;

INSERT INTO vacuna (nombre, enfermedad) VALUES 
('Fiebre Aftosa - Biogénesis Bagó', 'Fiebre Aftosa'),
('Brucelosis Cepa 19 - AgroVet', 'Brucelosis'),
('Mancha y Gangrena - Bayer', 'Clostridiosis'),
('Rabia Paresiante - Tecnovax', 'Rabia Paresiante');
```

## 🚀 Instalación y Ejecución

### 1. Ubicarse en la carpeta Backend

Abre tu terminal y navega hasta el directorio del Backend:

```bash
cd Backend
```

### 2. Instalar las dependencias

Ejecuta el siguiente comando para instalar todos los paquetes del proyecto:

```bash
npm install
```

### 3. Iniciar el servidor API

Ejecuta el servidor con Node.js:

```bash
node server.js
```

El servidor quedará escuchando en:
👉 **`http://localhost:3000`**

## 🌐 Endpoints de la API REST

### 🔑 Autenticación (`/api/auth`)
* `POST /api/auth/register` - Registro de nuevos usuarios (Administrador / Peón).
* `POST /api/auth/login` - Inicio de sesión y entrega de token JWT.

### 🐂 Animales (`/api/animales`)
* `GET /api/animales` - Obtener listado de animales (Requiere Token).
* `POST /api/animales` - Registrar un nuevo animal (Requiere Token).
* `DELETE /api/animales/:id` - Eliminar registro de animal (Requiere Token + Rol Administrador).

### 🌾 Potreros (`/api/potreros`)
* `GET /api/potreros` - Obtener listado de potreros (Requiere Token).
* `POST /api/potreros` - Crear potrero (Requiere Token + Rol Administrador).
* `DELETE /api/potreros/:id` - Eliminar potrero (Requiere Token + Rol Administrador).

### 🚜 Movimientos (`/api/movimientos`)
* `GET /api/movimientos` - Historial de traslados y bajas (Requiere Token).
* `POST /api/movimientos` - Registrar traslado/baja (Requiere Token).
* `DELETE /api/movimientos/:id` - Eliminar movimiento (Requiere Token + Rol Administrador).

### 💉 Sanidad (`/api/vacunaciones`)
* `GET /api/vacunaciones/catalogo` - Catálogo de vacunas (Requiere Token).
* `GET /api/vacunaciones` - Historial de aplicaciones (Requiere Token).
* `POST /api/vacunaciones` - Registrar vacunación (Requiere Token).
* `DELETE /api/vacunaciones/:id` - Eliminar registro sanitario (Requiere Token + Rol Administrador).

## 🛡️ Seguridad y Roles

El backend implementa dos middlewares de control:
1. **`verifyToken`**: Verifica la validez del token JWT en el encabezado `Authorization: Bearer <token>`.
2. **`verifyAdmin`**: Intercepta la petición y verifica que `req.user.rol === 'Administrador'`, bloqueando cualquier intento de borrado o modificación sensible por parte de usuarios no autorizados.
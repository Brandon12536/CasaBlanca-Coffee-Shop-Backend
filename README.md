# CasaBlanca Coffee Shop Backend ☕️

> ⚠️ **Token de prueba para APIs:**
> 
> Para probar los endpoints protegidos, usa el siguiente token Bearer en la cabecera `Authorization`:
> 
> ```
> Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImU1OTM0MWM3LWQ2ZDEtNDE0Yi05NTU5LTlmZGY3NWE5NWM4ZSIsImlhdCI6MTc0NDg1MDMxNywiZXhwIjoxNzQ3NDQyMzE3fQ.-nJrUQihhjzjTYdL4o1501-axlb-zbGKacrW_vpfuxU
> ```

Backend de la aplicación CasaBlanca Coffee Shop. Proporciona una API RESTful para gestionar productos, órdenes y usuarios, conectándose a una base de datos Supabase.

## Tecnologías principales

![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white&style=for-the-badge)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white&style=for-the-badge)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white&style=for-the-badge)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?logo=swagger&logoColor=black&style=for-the-badge)
![dotenv](https://img.shields.io/badge/dotenv-8DD6F9?logo=dotenv&logoColor=black&style=for-the-badge)
![Jest](https://img.shields.io/badge/Jest-C21325?logo=jest&logoColor=white&style=for-the-badge)
![CORS](https://img.shields.io/badge/CORS-00599C?logo=cloudflare&logoColor=white&style=for-the-badge)
![SQL](https://img.shields.io/badge/SQL-4479A1?logo=postgresql&logoColor=white&style=for-the-badge)
![HTTP](https://img.shields.io/badge/HTTP-005571?logo=httpie&logoColor=white&style=for-the-badge)
![Axios](https://img.shields.io/badge/Axios-5A29E4?logo=axios&logoColor=white&style=for-the-badge)

- 🚀 **Node.js**: Entorno de ejecución para JavaScript en el servidor.
- ⚡ **Express**: Framework web minimalista para Node.js, facilita la creación de APIs RESTful.
- 🗄️ **Supabase**: Plataforma backend como servicio (BaaS) que proporciona base de datos PostgreSQL y autenticación.
- 📄 **Swagger (OpenAPI)**: Herramienta para documentar y probar la API de forma interactiva.
- 🔐 **dotenv**: Permite la gestión de variables de entorno de manera sencilla y segura.
- 🧩 **Arquitectura modular**: Separación clara por controladores, modelos, servicios y rutas para un código mantenible.
- 🧪 **Jest**: Framework de testing para pruebas automatizadas (si está configurado en `/tests`).
- 🗃️ **SQL**: Scripts para la gestión y migración de datos (carpeta `/sql`).
- 🛡️ **CORS**: Middleware para habilitar el intercambio de recursos entre distintos orígenes.
- 🌐 **HTTP**: Protocolo de comunicación principal para la API RESTful.

## Estructura del proyecto

```
CasaBlanca-Coffee-Shop-Backend/
│   📄 server.js               # Punto de entrada principal
│   📦 package.json            # Dependencias y scripts
│   🌱 .env                    # Variables de entorno (no subir a git)
│
├── 🟨 src/
│   ├── 🟧 config/             # ⚙️ Configuración de Supabase
│   ├── 🟧 controllers/        # 🧠 Lógica de negocio para productos, órdenes y usuarios
│   ├── 🟧 middleware/         # 🛡️ Middlewares personalizados
│   ├── 🟧 models/             # 📝 Modelos de datos
│   ├── 🟧 routes/             # 🛣️ Definición de rutas (productos, órdenes, usuarios)
│   ├── 🟧 services/           # 💼 Lógica de interacción con la base de datos
│   └── 📄 swagger.js          # 📄 Configuración de Swagger
├── 🟩 sql/                    # 🗃️ Scripts SQL (si aplica)
├── 🟪 tests/                  # 🧪 Pruebas automatizadas


```

## Endpoints principales

- `/api/products` — Gestión de productos
- `/api/orders` — Gestión de órdenes
- `/api/users` — Gestión de usuarios
- `/api/health` — Chequeo de salud y conexión a Supabase
- `/api/test-supabase` — Test de conexión a Supabase
- `/api-docs` — Documentación interactiva Swagger

### Endpoints del carrito temporal de visitantes (`CartTemp`)

- **POST** `/api/cart/temp` — Agrega un producto al carrito temporal de visitantes.
- **GET** `/api/cart/temp` — Obtiene todos los productos del carrito temporal (por sesión o todos).
- **GET** `/api/cart/temp/count` — Obtiene el contador de productos en el carrito temporal.

## Seguridad y Acceso a Productos

### 🚦 Acceso público a productos
- La ruta `GET /api/products` para obtener y filtrar productos es **pública**: cualquier usuario puede consultar productos y aplicar filtros (búsqueda, categoría, precio, recencia) sin autenticación.


### 🧩 Filtros disponibles
- **search**: Busca productos por nombre o descripción.
- **category**: Filtra por categoría (ejemplo: `cafe`, `postres`, etc. El backend traduce estos valores al formato correcto de la base de datos).
- **priceOrder**: Ordena por precio ascendente (`asc`) o descendente (`desc`).
- **sort**: Ordena por productos más recientes (`recent`).

### 🛡️ Ejemplo de uso
```bash
curl "http://localhost:5050/api/products?category=cafe&search=capuchino&priceOrder=asc"
```

## Cómo iniciar el servidor

1. Instala las dependencias:
   ```bash
   npm install
   ```
2. Configura el archivo `.env` con tus variables de entorno (ver ejemplo `.env.example` si existe).
3. Inicia el servidor:
   ```bash
   npm start
   ```

El servidor correrá por defecto en el puerto **5050**.

## Notas adicionales
- El backend utiliza Supabase para el almacenamiento de datos.
- La documentación Swagger está disponible en `/api-docs`.
- La estructura modular facilita el mantenimiento y escalabilidad.

## Cambios recientes
- Se corrigió el filtrado acumulativo (puedes combinar búsqueda, categoría, precio y recientes).
- El backend traduce correctamente los valores de categoría del frontend.
- Documentación Swagger actualizada para reflejar la apertura de la ruta y los filtros disponibles.

---

<img src="API.jpg" alt="">
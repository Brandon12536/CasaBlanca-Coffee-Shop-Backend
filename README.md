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

## Ejecución en desarrollo con nodemon

Durante el desarrollo, puedes usar **nodemon** para reiniciar automáticamente el servidor cada vez que guardes cambios en los archivos fuente.

### ¿Qué es este mensaje?
Cuando ves en consola:

```
[nodemon] starting `node server.js`
```

Significa que nodemon está lanzando tu aplicación ejecutando el archivo principal (`server.js`). Si realizas cambios y guardas, nodemon reiniciará el proceso para reflejar los cambios sin que tengas que detener y volver a iniciar manualmente el servidor.

### ¿Cómo usar nodemon?
1. Instala nodemon globalmente (si no lo tienes):
   ```bash
   npm install -g nodemon
   ```
2. Inicia el servidor en modo desarrollo:
   ```bash
   nodemon server.js
   ```
   o usa el script definido en tu `package.json`:
   ```bash
   npm run dev
   ```
3. Observa la consola. Cada vez que veas el mensaje `[nodemon] starting \\`node server.js\\``, tu servidor se está reiniciando automáticamente.

## Reservaciones

- Se añadieron las nuevas APIs de **reservaciones**:
  - **POST** `/api/reservaciones` — Crea una nueva reservación.
  - **GET** `/api/reservaciones` — Obtiene todas las reservaciones.
  - **GET** `/api/reservaciones/{id}` — Obtiene una reservación por ID.
  - **PUT** `/api/reservaciones/{id}` — Actualiza una reservación por ID.
  - **DELETE** `/api/reservaciones/{id}` — Elimina una reservación por ID.
  - Los datos gestionados incluyen: nombre completo, correo electrónico, fecha y hora de visita, número de personas, notas adicionales y teléfono.
  - Documentación Swagger disponible para estas rutas bajo la etiqueta `Reservaciones`.

## Endpoints de Reseñas (Reviews) ⭐📝

### ✍️ Crear reseña
- **POST** `/api/reviews`
- **Body JSON:**
```json
{
  "user_id": "uuid-del-usuario",
  "product_id": "uuid-del-producto",
  "comment": "¡Muy buen café!",
  "rating": 5
}
```
- **Response 201:**
```json
{
  "id_reviews": "uuid-generado",
  "user_id": "uuid-del-usuario",
  "product_id": "uuid-del-producto",
  "comment": "¡Muy buen café!",
  "rating": 5,
  "created_at": "2025-05-06T12:00:00.000Z"
}
```

### 🔍 Obtener reseñas de un producto
- **GET** `/api/reviews/product/{productId}`
- **Response 200:**
```json
[
  {
    "id_reviews": "uuid1",
    "user_id": "uuid-usuario",
    "product_id": "uuid-producto",
    "comment": "Excelente calidad",
    "rating": 5,
    "created_at": "2025-05-06T12:00:00.000Z"
  }
]
```

### 👤 Obtener reseñas de un usuario
- **GET** `/api/reviews/user/{userId}`
- **Response 200:** igual al anterior pero filtrado por usuario.

### 📝 Editar reseña
- **PUT** `/api/reviews/{id_reviews}`
- **Body JSON:**
```json
{
  "comment": "Actualización del comentario",
  "rating": 4
}
```
- **Response 200:**
```json
{
  "id_reviews": "uuid1",
  "user_id": "uuid-usuario",
  "product_id": "uuid-producto",
  "comment": "Actualización del comentario",
  "rating": 4,
  "created_at": "2025-05-06T12:00:00.000Z"
}
```

### 🗑️ Eliminar reseña
- **DELETE** `/api/reviews/{id_reviews}`
- **Response 200:**
```json
{
  "message": "Review deleted"
}
```

---

## Endpoints de pagos (Stripe)

### POST `/api/stripe/create-payment-intent`
Crea un PaymentIntent de Stripe para iniciar el proceso de pago.

**Request Body:**
```json
{
  "amount": 1000,
  "currency": "mxn",
  "user_id": "<id_usuario>"
}
```
- `amount`: Monto en centavos (ej. 1000 = $10.00)
- `currency`: Moneda (por defecto `mxn`)
- `user_id`: ID del usuario autenticado

**Respuesta exitosa:**
```json
{
  "client_secret": "..."
}
```

---

### POST `/api/stripe/webhook`
Webhook de Stripe para registrar orden y pago tras pago exitoso. **Uso interno.**

- Recibe eventos de Stripe (objeto crudo del webhook).
- No requiere autenticación manual.

**Respuesta exitosa:**
```json
{
  "received": true
}
```

---

### POST `/api/stripe/checkout`
Registra la orden y el pago directo desde el frontend (requiere autenticación Bearer JWT).

**Request Body:**
```json
{
  "cart": [
    { "product_id": "...", "quantity": 2, "price": 150 },
    ...
  ],
  "shippingAddress": "Dirección de envío",
  "paymentMethod": "card",
  "stripePaymentId": "...",
  "amount": 1000,
  "currency": "mxn",
  "receiptUrl": "https://...",
  "stripeEventData": { }
}
```
- `cart`: Array de productos en el carrito
- `shippingAddress`: Dirección de envío
- `paymentMethod`: Método de pago (ej. `card`)
- `stripePaymentId`: ID del pago en Stripe
- `amount`: Monto total de la orden
- `currency`: Moneda
- `receiptUrl`: URL del recibo de Stripe
- `stripeEventData`: Datos adicionales del evento de Stripe (opcional)

**Respuesta exitosa:**
```json
{
  "success": true,
  "orderId": 123
}
```

## Cambios recientes
- Se corrigió el filtrado acumulativo (puedes combinar búsqueda, categoría, precio y recientes).
- El backend traduce correctamente los valores de categoría del frontend.
- Documentación Swagger actualizada para reflejar la apertura de la ruta y los filtros disponibles.

---

<img src="API.jpg" alt="">
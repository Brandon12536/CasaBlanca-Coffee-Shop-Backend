// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5050;

// Middlewares
// Configuración CORS específica para localhost
app.use((req, res, next) => {
  // Obtener el origen de la solicitud
  const origin = req.headers.origin || req.headers.referer || '*';
  console.log('Solicitud recibida desde origen:', origin);
  
  // Permitir solicitudes desde cualquier origen
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Si la solicitud incluye credenciales, debemos especificar el origen exacto
  if (req.headers.authorization || req.method !== 'GET') {
    // Para solicitudes autenticadas o no-GET, usar el origen específico
    const allowedOrigins = [
      'https://osdems-casa-blanca.netlify.app',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5050',
      'https://web-production-ff9a.up.railway.app'
    ];
    
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
  }
  

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Usar cors() como respaldo
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// Supabase client (para health checks, etc.)
const supabase = require("./src/config/supabase");

// Rutas
const productRoutes = require("./src/routes/productRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const cancelOrderRoutes = require("./src/routes/cancelOrderRoutes");
const userRoutes = require("./src/routes/userRoutes");
const addressRoutes = require("./src/routes/addressRoutes");
const cartRoutes = require("./src/routes/cartRoutes");
const reservationRoutes = require("./src/routes/reservationRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");
const stripeRoutes = require("./src/routes/stripeRoutes");
const reviewRoutes = require("./src/routes/reviewRoutes");
const ticketRoutes = require("./src/routes/ticketRoutes");
const testRoutes = require("./src/routes/testRoutes");

// Swagger UI
const { swaggerUi, swaggerSpec } = require("./src/swagger");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Montaje de rutas
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/orders", cancelOrderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/users/addresses", addressRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/reservaciones", reservationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/test", testRoutes);

// Health checks y endpoints de prueba
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get("/api/health", async (req, res) => {
  try {
    const { error } = await supabase.from("products").select("id").limit(1);
    if (error) throw error;
    res.status(200).json({
      status: "ok",
      message: "Conexión a Supabase establecida correctamente",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al conectar con Supabase",
      error: error.message,
    });
  }
});

app.get("/api/test-supabase", async (req, res) => {
  try {
    const { data, error } = await supabase.from("users").select("*").limit(1);
    if (error) throw error;
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/api/prueba-directa", (req, res) => {
  res.json({ ok: true });
});

// Arrancar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log("Conexión a Supabase configurada");
});

// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5050;

// Middlewares
// Configuración CORS mejorada
const allowedOrigins = [
  'https://casablanca-coffee-shop.netlify.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: function(origin, callback) {
    // Permitir solicitudes sin origen (como aplicaciones móviles o curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.log('Origen bloqueado por CORS:', origin);
      callback(null, true); // Temporalmente permitimos todos los orígenes para depurar
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Middleware para establecer encabezados CORS explícitamente
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Responder inmediatamente a las solicitudes OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});
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

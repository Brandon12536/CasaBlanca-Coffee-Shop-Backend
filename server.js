// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5050;

// Middlewares
// Configuración CORS específica para localhost
// Usar el middleware cors directamente con opciones personalizadas
const corsOptions = {
  origin: function (origin, callback) {
    // Lista de orígenes permitidos
    const allowedOrigins = [
      'https://osdems-casa-blanca.netlify.app',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5050',
      'https://web-production-ff9a.up.railway.app',
      'https://casablanca-coffee-shop-backend-production.up.railway.app'
    ];
    
    // Permitir solicitudes sin origen (como las de herramientas API o pruebas)
    if (!origin) {
      return callback(null, true);
    }
    
    // Verificar si el origen está en la lista de permitidos
    if (allowedOrigins.indexOf(origin) !== -1 || origin === 'null') {
      callback(null, true);
    } else {
      // Para desarrollo, permitir cualquier origen
      callback(null, true);
      // En producción, podrías querer ser más restrictivo:
      // callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
};

// Aplicar la configuración CORS a todas las rutas
app.use(cors(corsOptions));

// Log de solicitudes para depuración
app.use((req, res, next) => {
  const origin = req.headers.origin || req.headers.referer || 'desconocido';
  console.log(`Solicitud recibida desde origen: ${origin}, método: ${req.method}, ruta: ${req.path}`);
  next();
});

// No necesitamos una segunda instancia de cors
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

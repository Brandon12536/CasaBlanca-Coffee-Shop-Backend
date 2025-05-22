// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5050;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Supabase client (para health checks, etc.)
const supabase = require("./src/config/supabase");

// Rutas
const productRoutes = require("./src/routes/productRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const userRoutes = require("./src/routes/userRoutes");
const addressRoutes = require("./src/routes/addressRoutes"); // <-- import
const cartRoutes = require("./src/routes/cartRoutes");
const reservationRoutes = require("./src/routes/reservationRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");
const stripeRoutes = require("./src/routes/stripeRoutes");
const statsRoutes = require("./src/routes/statsRoutes"); // <-- Agrega esta línea

// Swagger UI
const { swaggerUi, swaggerSpec } = require("./src/swagger");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Montaje de rutas
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/users/addresses", addressRoutes); // <-- monta aquí
app.use("/api/cart", cartRoutes);
app.use("/api/reservaciones", reservationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/stats", statsRoutes); // <-- Agrega esta línea

// Health checks y endpoints de prueba
app.get("/", (req, res) => {
  res.send("API de CasaBlanca Coffee Shop funcionando correctamente");
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

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: "public",
    },
  }
);

// Verificación de conexión mejorada (versión async/await)
(async () => {
  try {
    const { error } = await supabase.from("products").select("id").limit(1);
    if (error) {
      console.error("❌ Error de conexión a Supabase:", error.message);
      process.exit(1);
    }
    console.log("✅ Conexión a Supabase verificada correctamente");
  } catch (error) {
    console.error("❌ Error fatal de conexión:", error.message);
    process.exit(1);
  }
})();

module.exports = supabase; // Exportación directa (sin llaves)

// test/statsService.test.js
require("dotenv").config();
const statsService = require("../src/services/statsService");

// Añade un pequeño delay para asegurar que Supabase se inicialice
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Función para ejecutar pruebas con manejo de errores
async function runTest(testName, testFn) {
  try {
    console.log(`\n=== Ejecutando prueba: ${testName} ===`);
    await delay(500); // Espera 500ms antes de cada test
    const result = await testFn();
    console.log("✅ Resultado:", result);
    return true;
  } catch (error) {
    console.error(`❌ Error en ${testName}:`, error.message);
    return false;
  }
}


// // Agrega esto a tus tests
// await runTest("getSalesByPeriod format validation", async () => {
//   const data = await statsService.getSalesByPeriod("month");

//   // Verifica que cada item tenga el formato correcto
//   data.forEach(item => {
//     if (!item.period_start || !item.period_end) {
//       throw new Error("Fechas faltantes");
//     }
//     if (isNaN(item.total_sales) || isNaN(item.order_count)) {
//       throw new Error("Valores numéricos inválidos");
//     }
//   });

//   return "✅ Formato validado correctamente";
// });
async function main() {
  // 1. Prueba de resumen de ventas
  await runTest("getSalesSummary", async () => {
    return await statsService.getSalesSummary();
  });

  // 2. Prueba de ventas por período
  await runTest("getSalesByPeriod (month)", async () => {
    return await statsService.getSalesByPeriod("month");
  });

  // 3. Prueba de productos más vendidos
  await runTest("getTopProducts", async () => {
    return await statsService.getTopProducts(5);
  });

  // 4. Prueba de estadísticas de clientes
  await runTest("getCustomerStats", async () => {
    return await statsService.getCustomerStats();
  });

  // 5. Prueba de estadísticas de reservaciones
  await runTest("getReservationStats", async () => {
    return await statsService.getReservationStats();
  });

  console.log("\n✔ Todas las pruebas completadas");
}

main().catch(console.error);

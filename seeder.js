require("dotenv").config();
const bcrypt = require("bcryptjs");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function resetTables() {
  console.log("🧹 Limpiando tablas...");

  const tablePrimaryKeys = {
    payments: "id_payments",
    cart: "id_cart",
    cart_temp: "id_cart_temp",
    reservaciones: "id_reservaciones",
    order_items: "id",
    orders: "id",
    products: "id",
    users: "id",
  };

  for (const [table, primaryKey] of Object.entries(tablePrimaryKeys)) {
    const { error } = await supabase
      .from(table)
      .delete()
      .not(primaryKey, "is", null);
    if (error) {
      console.error(`❌ Error limpiando ${table}:`, error.message);
    }
  }
}

async function seed() {
  console.log("🌱 Ejecutando seeder...");
  await resetTables();

  const adminPassword = await bcrypt.hash("admin123", 10);
  const customerPassword = await bcrypt.hash("customer123", 10);

  const usersPayload = [
    {
      name: "Admin Demo",
      email: "admin@demo.com",
      password: adminPassword,
      role: "admin",
    },
    {
      name: "Cliente Demo",
      email: "cliente@demo.com",
      password: customerPassword,
      role: "customer",
    },
  ];

  const { data: users, error: userError } = await supabase
    .from("users")
    .insert(usersPayload)
    .select();

  if (userError) {
    console.error("❌ Error insertando usuarios:", userError.message);
    return;
  }

  console.log("✅ Usuarios creados");

  const productsPayload = [
    {
      name: "Café Espresso",
      description: "Un shot intenso de café premium.",
      price: 40,
      category: "café",
      image: "https://placehold.co/400x300?text=Espresso",
      available: true,
      featured: true,
    },
    {
      name: "Pastel Red Velvet",
      description: "Suave pastel rojo con betún de queso crema.",
      price: 70,
      category: "postres",
      image: "https://placehold.co/400x300?text=Red+Velvet",
      available: true,
      featured: false,
    },
    {
      name: "Smoothie de Fresa",
      description: "Bebida fría de fresas naturales.",
      price: 55,
      category: "bebidas",
      image: "https://placehold.co/400x300?text=Smoothie",
      available: true,
      featured: false,
    },
  ];

  const { data: products, error: productsError } = await supabase
    .from("products")
    .insert(productsPayload)
    .select();

  if (productsError) {
    console.error("❌ Error insertando productos:", productsError.message);
    return;
  }

  console.log("✅ Productos creados");

  const customerId = users.find((u) => u.role === "customer").id;

  const orderPayload = [
    {
      user_id: customerId,
      total: products[0].price + products[1].price,
      payment_method: "tarjeta",
      status: "preparando",
      shipping_address: "Calle Falsa 123, CDMX",
    },
    {
      user_id: customerId,
      total: products[2].price * 2,
      payment_method: "efectivo",
      status: "pendiente",
      shipping_address: "Av. Reforma 456, CDMX",
    },
    {
      user_id: customerId,
      total: products[1].price,
      payment_method: "transferencia",
      status: "entregado",
      shipping_address: "Sin dirección (pickup)",
    },
    {
      user_id: customerId,
      total: products[0].price * 3,
      payment_method: "tarjeta",
      status: "cancelado",
      shipping_address: "Insurgentes Sur 789, CDMX",
    },
  ];

  const { data: orders, error: orderError } = await supabase
    .from("orders")
    .insert(orderPayload)
    .select();

  if (orderError) {
    console.error("❌ Error creando órdenes:", orderError.message);
    return;
  }

  console.log("✅ Órdenes creadas");

  const orderItemsPayload = [
    // Orden 1: Espresso + Red Velvet
    {
      order_id: orders[0].id,
      product_id: products[0].id,
      quantity: 1,
      price: products[0].price,
    },
    {
      order_id: orders[0].id,
      product_id: products[1].id,
      quantity: 1,
      price: products[1].price,
    },

    // Orden 2: 2 Smoothies
    {
      order_id: orders[1].id,
      product_id: products[2].id,
      quantity: 2,
      price: products[2].price,
    },

    // Orden 3: Red Velvet
    {
      order_id: orders[2].id,
      product_id: products[1].id,
      quantity: 1,
      price: products[1].price,
    },

    // Orden 4: 3 Espressos
    {
      order_id: orders[3].id,
      product_id: products[0].id,
      quantity: 3,
      price: products[0].price,
    },
  ];

  const { error: orderItemsError } = await supabase
    .from("order_items")
    .insert(orderItemsPayload);

  if (orderItemsError) {
    console.error(
      "❌ Error creando detalles de orden:",
      orderItemsError.message
    );
    return;
  }

  console.log("✅ Detalles de orden creados");
  console.log("🌱 Seeder finalizado correctamente 🚀");
}

seed();

const stripe = require("../config/stripe");
const supabase = require("../config/supabase");
const { pesosToCents } = require("../utils/moneyUtils");

exports.createPaymentAndOrder = async (req, res) => {
  const { total, amount, items, ...rest } = req.body;
  const paymentData = rest; // Todos los demás campos de pago

  // Función mejorada para manejar la conversión a centavos
  const parseToCents = (value) => {
    // Si el valor ya es número y mayor o igual a 100, asumir que ya está en centavos
    if (typeof value === "number" && value >= 100) {
      return Math.round(value);
    }

    // Si es string, limpiar y convertir a número
    if (typeof value === "string") {
      value = parseFloat(value.replace(/[^0-9.]/g, ""));
    }

    // Validar que sea un número válido
    if (isNaN(value)) {
      throw new Error("El monto proporcionado no es válido");
    }

    // Si el valor es menor que 100, asumir que está en pesos y convertir a centavos
    if (value < 100) {
      console.log(
        `Conversión: ${value} pesos → ${Math.round(value * 100)} centavos`
      );
      return Math.round(value * 100);
    }

    // Si ya es mayor o igual a 100, asumir que ya está en centavos
    return Math.round(value);
  };

  try {
    // Convertir los montos a centavos
    const totalInCents = parseToCents(total);
    const amountInCents = parseToCents(amount);

    console.log(`[DEBUG] Conversión final:
      Total recibido: ${total} → ${totalInCents} centavos
      Amount recibido: ${amount} → ${amountInCents} centavos`);

    // Insertar en orders
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([{ total: totalInCents, ...rest }])
      .select()
      .single();

    if (orderError) throw orderError;

    // Insertar items (convertir cada precio a centavos)
    const orderItems = items.map((item) => ({
      ...item,
      price: parseToCents(item.price),
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);
    if (itemsError) throw itemsError;

    // Insertar pago
    const { error: paymentError } = await supabase.from("payments").insert([
      {
        amount: amountInCents,
        ...paymentData,
      },
    ]);

    if (paymentError) throw paymentError;

    res.status(201).json({
      success: true,
      amount_in_cents: amountInCents,
      total_in_cents: totalInCents,
    });
  } catch (error) {
    console.error("[ERROR] En paymentController:", error);
    res.status(500).json({
      error: "Error al procesar pago",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

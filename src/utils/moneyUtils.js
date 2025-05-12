/**
 * Convierte un monto monetario a centavos (entero)
 * @param {number|string} amount - El monto a convertir (puede ser en pesos o centavos)
 * @returns {number} El monto en centavos (entero)
 * @throws {Error} Si el monto no es válido
 */
function pesosToCents(amount) {
  // Si el valor es null, undefined o vacío
  if (amount === null || amount === undefined || amount === "") {
    throw new Error("El monto no puede estar vacío");
  }

  // Si ya es número y mayor o igual a 100, asumir que ya está en centavos
  if (typeof amount === "number") {
    if (amount >= 100) {
      return Math.round(amount);
    }
    // Si es menor a 100, asumir que está en pesos
    return Math.round(amount * 100);
  }

  // Si es string, limpiar y convertir
  if (typeof amount === "string") {
    // Eliminar cualquier caracter que no sea dígito o punto decimal
    const cleaned = amount.replace(/[^0-9.]/g, "");

    // Validar que tenga formato numérico correcto
    if (!/^\d*\.?\d*$/.test(cleaned)) {
      throw new Error("Formato de monto inválido");
    }

    amount = parseFloat(cleaned);
    if (isNaN(amount)) {
      throw new Error("El monto no es un número válido");
    }
  }

  // Si llegamos aquí, amount es un número (ya convertido)
  // Convertir a centavos solo si es menor que 100 (asumir que está en pesos)
  const cents = amount < 100 ? Math.round(amount * 100) : Math.round(amount);

  // Validaciones finales
  if (cents < 0) {
    throw new Error("El monto no puede ser negativo");
  }

  if (!Number.isInteger(cents)) {
    throw new Error("El monto debe ser un número entero (centavos)");
  }

  return cents;
}

/**
 * Convierte centavos a pesos con formato decimal
 * @param {number|string} cents - La cantidad en centavos
 * @returns {number} El monto en pesos (con 2 decimales)
 * @throws {Error} Si los centavos no son válidos
 */
function centsToPesos(cents) {
  // Validar entrada
  if (cents === null || cents === undefined || cents === "") {
    throw new Error("Los centavos no pueden estar vacíos");
  }

  // Convertir a número si es string
  if (typeof cents === "string") {
    cents = cents.replace(/[^0-9]/g, "");
    if (cents === "") {
      throw new Error("Centavos no válidos");
    }
    cents = parseInt(cents, 10);
  }

  // Validar que sea un número entero positivo
  if (isNaN(cents) || !Number.isInteger(cents) || cents < 0) {
    throw new Error("Los centavos deben ser un número entero positivo");
  }

  // Convertir a pesos (dividir por 100)
  return parseFloat((cents / 100).toFixed(2));
}

module.exports = {
  pesosToCents,
  centsToPesos,
};

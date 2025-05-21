/**
 * Convierte un monto monetario a centavos (entero)
 * @param {number|string} amount - El monto a convertir (en formato de pesos)
 * @returns {number} El monto en centavos (entero)
 * @throws {Error} Si el monto no es válido
 */
function pesosToCents(amount) {
  // Si el valor es null, undefined o vacío
  if (amount === null || amount === undefined || amount === "") {
    throw new Error("El monto no puede estar vacío");
  }

  let numericValue;

  // Si ya es número, usarlo directamente
  if (typeof amount === 'number') {
    console.log('Valor numérico recibido:', amount);
    numericValue = amount;
  } 
  // Si es string, limpiar y convertir a número
  else if (typeof amount === 'string') {
    console.log('Valor string recibido:', amount);
    // Eliminar cualquier caracter que no sea dígito, punto o coma
    const cleaned = amount.replace(/[^0-9.,]/g, '');
    // Reemplazar comas por punto para el parseo
    const normalized = cleaned.replace(',', '.');
    
    console.log('Valor limpio y normalizado:', normalized);
    
    // Validar que sea un número válido
    if (!/^\d*(\.\d{0,2})?$/.test(normalized)) {
      throw new Error("Formato de monto inválido");
    }
    
    numericValue = parseFloat(normalized);
    if (isNaN(numericValue)) {
      throw new Error("El monto no es un número válido");
    }
    console.log('Valor numérico parseado:', numericValue);
  } else {
    throw new Error("Tipo de dato no soportado para conversión de monto");
  }

  // Validar que no sea negativo
  if (numericValue < 0) {
    throw new Error("El monto no puede ser negativo");
  }

  // Convertir a centavos (multiplicar por 100 y redondear)
  const cents = Math.round(numericValue * 100);
  
  console.log('Valor convertido a centavos:', cents);

  // Validar que sea un entero válido
  if (!Number.isInteger(cents)) {
    throw new Error("Error al convertir el monto a centavos");
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

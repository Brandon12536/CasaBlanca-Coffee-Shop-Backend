// tests/orderController.test.js
// Ejemplo de prueba unitaria

// Suponiendo que tienes una función suma en tu controlador:
// exports.suma = (a, b) => a + b;

const suma = (a, b) => a + b;

test('suma dos números correctamente', () => {
  expect(suma(2, 3)).toBe(5);
});

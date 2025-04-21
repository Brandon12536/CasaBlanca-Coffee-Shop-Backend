// tests/orderRoutes.test.js
// Prueba de integración para el endpoint de órdenes usando Supertest

const request = require('supertest');
const express = require('express');


const app = require('../src/app');

describe('POST /api/orders', () => {
  it('debe rechazar sin token', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ items: ['producto1', 'producto2'] });
    expect(res.statusCode).toBe(401);
  });
});

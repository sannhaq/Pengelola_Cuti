/* eslint-disable no-undef */
const request = require('supertest');
const Express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = new Express();

app.use('/employee', require('../../src/routes/employee.route'));

const lastNik = async () => {
  const employee = await prisma.employee.findMany();
  return employee[employee.length - 1].nik;
};

describe('GET /employee', () => {
  it('Should get all employees', async () => {
    const response = await request(app).get('/employee');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toBeInstanceOf(Array);
  });
});

describe('GET /employee/:nik', () => {
  it('Should get employees by NIK', async () => {
    const nik = await lastNik();
    const response = await request(app).get(`/employee/${nik}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('data');
  });
});

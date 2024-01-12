const request = require('supertest');
const Express = require('express');
const { configServer } = require('../../src/configs/server.config');

const app = new Express();
configServer(app);
app.use('/leave', require('../../src/routes/leave.route'));
let authToken; // Untuk menyimpan token setelah login

describe('GET /leave/history/:nik', () => {
  // Langkah 1: Melakukan login dan menyimpan token
  beforeAll(async () => {
    const loginResponse = await request(app).post('/auth/login').send({
      email: 'admin@gmail.com',
      password: 'password',
    });

    authToken = loginResponse.body.accessToken;
  });

  it('Should get leave with nik 14', async () => {
    // Langkah 2: Menggunakan token dalam permintaan untuk /leave/history/14/testing (endpoint khusus untuk pengujian)
    const response = await request(app)
      .get('/leave/history/14/testing')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.statusCode).toBe(200);
  });
});

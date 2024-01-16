const request = require('supertest');
const Express = require('express');
const { configServer } = require('../../src/configs/server.config');

const app = new Express();
configServer(app);
app.use('/auth', require('../../src/routes/auth.route'));

const loginAccountNotExistRequest = {
  email: 'limapuluhsatu@gmail.com',
  password: 'password',
};
const loginRequest = {
  email: 'admin@gmail.com',
  password: 'password',
};

describe('POST /auth/login', () => {
  it('Should login return error because the account is not exist', async () => {
    const response = await request(app).post('/auth/login').send(loginAccountNotExistRequest);

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBeTruthy();
  });

  it('Should login return error because the password is wrong', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        ...loginRequest,
        password: 'wrong password',
      });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBeTruthy();
  });

  it('Should login with superadmin account and get token', async () => {
    const response = await request(app).post('/auth/login').send(loginRequest);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('accessToken');
    expect(response.body.data.accessToken).toBeTruthy();
  });
});

describe('POST /auth/refresh', () => {
  it('Should return forbidden because the refresh token is not found', async () => {
    const response = await request(app).post('/auth/refresh').send({});

    expect(response.statusCode).toBe(500);
  });
});

describe('POST /auth/logout', () => {
  it('Should return forbidden because the refresh token is not found', async () => {
    const response = await request(app).post('/auth/logout').send({});

    expect(response.statusCode).toBe(401);
  });
});

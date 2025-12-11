const request = require('supertest');
const jwt = require('jsonwebtoken');

// Mock wallet client to avoid external calls during tests
jest.mock('../src/services/WalletClient', () => ({
  createWalletForUser: jest.fn().mockResolvedValue(),
}));

process.env.JWT_SECRET = process.env.JWT_SECRET || 'ILIACHALLENGE';

const app = require('../src/app');
const { sequelize } = require('../src/models');
require('../src/models/User');

const sign = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

describe('Users Service - Auth and CRUD', () => {
  let server;

  beforeAll(async () => {
    // Bind explicitly to localhost to avoid sandbox restrictions on 0.0.0.0
    server = app.listen(0, '127.0.0.1');
    await sequelize.sync({ force: true });
  });

  afterEach(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await sequelize.close();
  });

  test('registers a user and returns basic info', async () => {
    const res = await request(server)
      .post('/api/users')
      .send({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
    });
    expect(res.body.id).toBeDefined();
  });

  test('authenticates a user and returns a token', async () => {
    // create user first
    await request(server).post('/api/users').send({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      password: 'password123',
    });

    const res = await request(server).post('/api/auth').send({
      email: 'john@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.access_token).toBeDefined();
    expect(res.body.user.email).toBe('john@example.com');
  });

  test('gets, updates, and deletes a user with valid token', async () => {
    const createRes = await request(server).post('/api/users').send({
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane@example.com',
      password: 'password123',
    });

    const userId = createRes.body.id;
    const token = sign({ userId, email: 'jane@example.com' });

    const getRes = await request(server)
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.email).toBe('jane@example.com');

    const patchRes = await request(server)
      .patch(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ first_name: 'Janet' });
    expect(patchRes.status).toBe(200);
    expect(patchRes.body.first_name).toBe('Janet');

    const deleteRes = await request(server)
      .delete(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body).toEqual({ message: 'User deleted successfully' });
  });
});



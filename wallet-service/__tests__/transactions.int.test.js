const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const { sequelize } = require('../src/models');
require('../src/models/Wallet');
require('../src/models/Transaction');

// Increase timeout for DB setup/teardown in CI
jest.setTimeout(20000);

// Ensure env defaults for tests
process.env.PRIVATE_KEY = process.env.PRIVATE_KEY || 'ILIACHALLENGE';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'ILIACHALLENGE';
process.env.JWT_SECRET_INTERNAL = process.env.JWT_SECRET_INTERNAL || 'ILIACHALLENGE_INTERNAL';

const signExternal = (payload) =>
  jwt.sign(payload, process.env.PRIVATE_KEY, { expiresIn: '1h' });

describe('Wallet Service - External Transactions', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterEach(async () => {
    // Truncate tables instead of full sync to reduce test time
    const models = sequelize.models;
    await Promise.all(
      Object.keys(models).map((key) => models[key].destroy({ where: {}, force: true }))
    );
  });

  afterAll(async () => {
    await sequelize.close();
  });

  const userId = '11111111-1111-1111-1111-111111111111';

  test('creates a credit transaction and returns formatted response', async () => {
    const token = signExternal({ userId });

    const res = await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ user_id: userId, type: 'CREDIT', amount: 100 });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      user_id: userId,
      type: 'CREDIT',
      amount: 100,
    });
    expect(res.body.id).toBeDefined();
  });

  test('lists transactions for the authenticated user', async () => {
    const token = signExternal({ userId });

    // seed one credit and one debit
    await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ user_id: userId, type: 'CREDIT', amount: 200 });

    await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ user_id: userId, type: 'DEBIT', amount: 50 });

    const res = await request(app)
      .get('/transactions')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty('type');
    expect(res.body[0]).toHaveProperty('amount');
  });

  test('returns consolidated balance via single aggregation', async () => {
    const token = signExternal({ userId });

    await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ user_id: userId, type: 'CREDIT', amount: 150 });

    await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ user_id: userId, type: 'DEBIT', amount: 40 });

    const res = await request(app)
      .get('/balance')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ amount: 110 });
  });
});


const { Sequelize } = require('sequelize');
require('dotenv').config();

const isTest = process.env.NODE_ENV === 'test';

const sequelize = new Sequelize(
  isTest ? 'sqlite::memory:' : process.env.DB_NAME,
  isTest ? undefined : process.env.DB_USER,
  isTest ? undefined : process.env.DB_PASSWORD,
  {
    host: isTest ? undefined : process.env.DB_HOST,
    port: isTest ? undefined : process.env.DB_PORT,
    dialect: isTest ? 'sqlite' : 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: isTest
      ? undefined
      : {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
  }
);

module.exports = sequelize;


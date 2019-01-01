require('../helpers/loadenv')

module.exports = {
  development: {
    username: "postgres",
    password: "postgres",
    database: "postgres",
    host: "127.0.0.1",
    dialect: "postgres"
  },
  test: {
    username: "postgres",
    password: "postgres",
    database: "postgres",
    host: "127.0.0.1",
    dialect: "postgres"
  },
  production: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    logging: false,
    dialect: 'postgres',
  }
}

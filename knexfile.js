require('dotenv').config();

module.exports = {

  development: {
    client: 'oracledb',
    connection: {
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECT_STRING,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './src/repositories/migrations',
    }
  }

};

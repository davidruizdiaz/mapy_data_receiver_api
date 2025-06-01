const path = require('path');

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
      directory: path.resolve(__dirname, 'src/repositories/migrations'),
    },
    pool: { min: 0, max: 3 },
    log: {
      warn(message) {
        console.warn('[Knex warn]', message);
      },
      error(message) {
        console.error('[Knex error]', message);
      },
      deprecate(message) {
        console.log('[Knex deprecate]', message);
      },
      debug(message) {
        console.log('[Knex debug]', message);
      }
    }
  },
  production: {
    client: 'oracledb',
    connection: {
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECT_STRING,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: path.resolve(__dirname, 'src/repositories/migrations'),
    },
    pool: { min: 0, max: 3 },
    log: {
      warn(message) {
        console.warn('[Knex warn]', message);
      },
      error(message) {
        console.error('[Knex error]', message);
      },
      deprecate(message) {
        console.log('[Knex deprecate]', message);
      },
      debug(message) {
        console.log('[Knex debug]', message);
      }
    }
  }
};

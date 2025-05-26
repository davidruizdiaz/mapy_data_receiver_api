require('dotenv').config();
const knex = require('knex');

const db = knex({
  client: process.env.ORACLE_CLIENT,
  connection: {
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectString: process.env.ORACLE_CONNECT_STRING,
  },
  pool: { min: 0, max: 7 },
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
});

db.on('query', (queryData) => {
  console.log('[QUERY SQL]:', queryData.sql);
  console.log('[BINDINGS]:', queryData.bindings);
});

module.exports = db;

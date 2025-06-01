const knex = require('knex');

const knexfile = require('../../../knexfile');

const env = process.env.NODE_ENV || 'development';

const db = knex(knexfile[env]);

db.on('query', (queryData) => {
  console.log('[QUERY SQL]:', queryData.sql);
  console.log('[BINDINGS]:', queryData.bindings);
});

module.exports = db;

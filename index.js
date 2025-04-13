require('dotenv').config();
const fastify = require("fastify")({ logger: true });

fastify.register(require('./src/presentation'), { prefix: '/api' })

fastify.listen({ port: 3300 }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(process.env.ORACLE_DATA_PATH)
});

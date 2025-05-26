require('dotenv').config();
const fastify = require("fastify")({ logger: true });

fastify.register(require('./routes'), { prefix: '/api' })

const start = async () => {
  try {
    await fastify.listen({ port: 3300 })
    fastify.log.info(`Servidor corriendo en http://localhost:${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err)
    process.exit(1);
  }
}

start();


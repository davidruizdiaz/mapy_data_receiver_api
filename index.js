const fastify = require("fastify")({ logger: true });

fastify.register(require('./src/presentation/detectionRoute'), { prefix: '/api' })

fastify.listen({ port: 3300 }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});

const fastify = require("./src/presentation/detectionRoute");

fastify.listen({ port: 3300 }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Servidor corriendo en ${address}`)
});

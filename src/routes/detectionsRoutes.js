const sevice = require("../services/detectionsService");

/**
 * Implementa las rutas para /detections
 */
module.exports = function(fastify, opts, done) {
  fastify.post('/add', async (request, reply) => {
    try {
      const { detections: detectionsData } = request.body;
      const result = await sevice.addDetections(detectionsData);
      reply.send(result);
    } catch (error) {
      fastify.log.error(error)
      reply.code(500).send({
        ok: false,
        error: error.message
      });
    }
  });
  fastify.post('/getLastTransaction', async (request, reply) => {
    try {
      const result = await sevice.getLastDetectionService();
      reply.send(result);
    } catch (error) {
      fastify.log.error(error)
      const status = error.message.includes('No hay registros') ? 404 : 500;
      reply.code(status).send({
        ok: false,
        error: error.message
      });
    }
  });
  done();
}

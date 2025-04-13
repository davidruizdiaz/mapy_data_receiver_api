const sevice = require("../aplication/detectionService");

/**
 * Implementa las rutas para /detections
 */
module.exports = function(fastify, opts, done) {
  fastify.post('/add', (request, reply) => {
    try {
      const { detections: detectionsData } = request.body;
      if (!detectionsData || detectionsData.length === 0) {
        throw new Error('[Presentation] Se recibieron datos vacíos');
      }
      const result = sevice.addDetections(detectionsData);
      reply.send(result);
    } catch (error) {
      fastify.log.error(error)
      reply.code(500).send({
        ok: false,
        error: error.message
      });
    }
  });
  done();
}

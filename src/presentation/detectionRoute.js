const sevice = require("../aplication/detectionService");

const fastify = require("fastify")({ logger: true });

fastify.post('/add', (request, reply) => {
  try {
    const { detections: detectionsData } = request.body;
    if (!detectionsData || detectionsData.length === 0) {
      throw new Error('[Presentation] Error en los datos recibidos');
    }
    const result = sevice.addDetections(detectionsData);
    reply.send(result);
  } catch (error) {
    fastify.log.error(error)
    res.code(500).send({
      ok: false,
      error: error.message
    });
  }
});

module.exports = fastify;

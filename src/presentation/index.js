/**
 * Registra las rutas para /detectios
 */
module.exports = function(fastify, opts, done) {
  fastify.register(require('./detectionsRoutes'), { prefix: 'detections' });
  done();
};

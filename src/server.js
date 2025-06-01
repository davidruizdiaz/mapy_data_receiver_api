const { loadEnvironment } = require('./config/loadEnv');
loadEnvironment();

const db = require('./repositories/config/dbConfig');

const runMigrations = async () => {
  try {
    console.log('🔄 Ejecutando migraciones...');
    await db.migrate.latest();
    console.log('✅ Migraciones aplicadas correctamente');
  } catch (err) {
    console.error('❌ Error al ejecutar las migraciones:', err.message);
    process.exit(1); // Detiene la app si las migraciones fallan
  }
};

const start = async () => {
  const fastify = require("fastify")({ logger: true });
  fastify.register(require('./routes'), { prefix: '/api' })

  try {
    await fastify.listen({ port: process.env.PORT, host: process.env.HOST })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1);
  }
}

if (process.env.RUN_MIGRATIONS === 'true') {
  runMigrations().then(start);
} else {
  start();
}


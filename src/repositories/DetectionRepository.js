const db = require('./config/dbConfig');

const BATCH_SIZE = 100;

const insertBatchDetections = async (detections) => {
  try {
    if (!Array.isArray(detections) || detections.length === 0) {
      throw new Error('[REPOSITORY] No hay datos que guardar');
    }
    await db.batchInsert('detections', detections, BATCH_SIZE);
  } catch (err) {
    const error = '[REPOSITORY] Error al guardar los datos';
    console.error(error, err.message);
    throw new Error(error);
  }
};

const getLastDetection = async () => {
  try {
    const detection = await db('detections').orderBy('fecha', 'desc').first();
    return detection || null;
  } catch (err) {
    const error = '[REPOSITORY] Error al recuperar los datos';
    console.log(error, err.message);
    throw new Error(error);
  }
}

module.exports = {
  insertBatchDetections,
  getLastDetection,
}

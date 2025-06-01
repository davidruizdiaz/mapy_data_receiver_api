const { createDetectionFromData } = require("../models/Detection");
const { getMaxListeners } = require("../repositories/config/dbConfig");
const { insertBatchDetections, getLastDetection, } = require("../repositories/DetectionRepository");

const sevice = {
  addDetections: async function(detectionsData) {
    try {
      if (!Array.isArray(detectionsData) || detectionsData.length === 0) {
        const error = '[SERVICE] Se recibieron datos inválidos';
        console.log(error)
        throw new Error(error);
      }
      const detections = detectionsData.map(d => createDetectionFromData(d));
      await insertBatchDetections(detections)
      return {
        ok: true,
        message: '[SERVICE] Se guardaron los datos'
      }
    } catch (err) {
      const error = '[SERVICE] Error inesperado al procesar los datos'
      console.log(error, { cause: err.message })
      throw new Error(error);
    }
  },
  getLastDetectionService: async () => {
    try {
      const detection = await getLastDetection();
      if (!detection) {
        const error = '[SERVICE] No hay registros';
        console.log(error)
        throw new Error(error);
      }
      return {
        ok: true,
        fecha: detection.fecha,
      }
    } catch (err) {
      const error = '[SERVICE] Error inesperado al procesar los datos'
      console.log(error, { cause: err.message })
      throw new Error(error);
    }
  },
};

module.exports = sevice;

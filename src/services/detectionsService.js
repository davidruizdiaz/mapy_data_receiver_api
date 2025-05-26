const { createDetectionFromData } = require("../models/Detection");
const { insertBatchDetections } = require("../repositories/DetectionRepository");

const sevice = {
  addDetections: async function(detectionsData) {
    try {
      if (!Array.isArray(detectionsData) || detectionsData.length === 0) {
        throw new Error('[SERVICE] Se recibieron datos inválidos');
      }
      const detections = detectionsData.map(d => createDetectionFromData(d));
      await insertBatchDetections(detections)
      return {
        ok: true,
        message: '[SERVICE] Se guardaron los datos'
      }
    } catch (err) {
      const error = '[SERVICE] Error inesperado al procesar los datos'
      console.log(error, err.message)
      throw new Error(error);
    }
  },
};

module.exports = sevice;

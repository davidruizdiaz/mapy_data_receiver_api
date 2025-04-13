const { createDetectioFromData } = require("../domain/Detection");

const sevice = {
  addDetections: function(detectionsData) {
    const detections = detectionsData.map(d => createDetectioFromData(d));
    return {
      ok: true,
      message: [...detections]
    }
  },
};

module.exports = sevice;

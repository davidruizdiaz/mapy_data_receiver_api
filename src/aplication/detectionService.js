const { createFromData } = require("../domain/Detection");

const sevice = {
  addDetections: function(detectionsData) {
    // console.log(Array.isArray(detectionsData))
    const detections = detectionsData.map(d => createFromData(d));
    return {
      ok: true,
      x: 'kkkk',
      message: [...detections]
    }
  },
};

module.exports = sevice;

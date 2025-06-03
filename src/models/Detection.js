const dayjs = require("../utils/dateUtil");


class Detection {
  constructor(id_zona, clase, fecha) {
    this.id_zona = id_zona;
    this.clase = clase;
    this.fecha = dayjs.utc(fecha, 'YYYY-MM-DD HH:mm:ss').toDate();
  }
  static createDetectionFromData(data) {
    if (!data.id_zona || !data.clase || !data.fecha) {
      throw new Error('[DOMAIN] Los datos no corresponden a una detección');
    }
    const { id_zona, clase, fecha } = data
    return new Detection(id_zona, clase, fecha);
  }
}

module.exports = Detection;

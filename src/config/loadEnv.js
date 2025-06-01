const { config } = require('dotenv');
const path = require('path');
const { existsSync } = require('fs');

function loadEnvironment() {
  try {
    const externalEnvPath = path.resolve(__dirname, '../../../config.env');
    const internalEnvPath = path.resolve(__dirname, '../../.env');
    console.log(__dirname)
    let selectedPath;
    if (existsSync(externalEnvPath)) {
      selectedPath = externalEnvPath;
    } else if (existsSync(internalEnvPath)) {
      selectedPath = internalEnvPath;
    }

    if (selectedPath) {
      config({ path: selectedPath });
      console.log(`✅ Variables de entorno cargadas desde: ${selectedPath}`);
    } else {
      console.warn('⚠️ No se encontró ningún archivo .env');
    }
  } catch (error) {
    console.error('[CONFIG] ❌ Error al cargar el archivo .env:', error.message);
    throw error;
  }
}

module.exports = { loadEnvironment };

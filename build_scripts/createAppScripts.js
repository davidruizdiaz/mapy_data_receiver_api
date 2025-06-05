const fs = require('fs-extra');
const path = require('path');

/**
 * Crea los scripts start-app.sh y stop-app.sh y los guarda en el directorio del paquete.
 * @param {object} config - Objeto de configuración con appName, appVersion, distDir.
 */
async function createAppScripts(config) {
  const { appName, appVersion, distDir } = config;
  const debPackageDir = path.join(distDir, `${appName}_${appVersion}`);
  const appInstallDir = path.join(debPackageDir, 'opt', appName);
  const appProjectDir = path.join(appInstallDir, 'app');

  console.log('󰻭 Creando scripts de inicio y parada de la aplicación...');

  const startAppScriptContent = `#!/bin/bash
# Este script se ejecuta para iniciar la aplicación Node.js

APP_PATH="${appProjectDir}"

cd "$APP_PATH" || { echo "⚠️ Error: No se pudo cambiar al directorio de la aplicación."; exit 1; }

if [ ! -d "node_modules" ]; then
    echo "⏳Instalando dependencias de Node.js (esto puede tardar)..."
    npm install --production || { echo "⚠️ Error: Falló la instalación de dependencias."; exit 1; }
fi

echo "⏳Iniciando la aplicación Node.js..."
node index.js &
echo $! > /var/run/${appName}.pid
echo "✔️ Aplicación iniciada con PID: $(cat /var/run/${appName}.pid)"
`;

  const stopAppScriptContent = `#!/bin/bash
# Este script se ejecuta para detener la aplicación Node.js

echo "⏳Intentando detener la aplicación Node.js..."
if [ -f "/var/run/${appName}.pid" ]; then
    PID=$(cat /var/run/${appName}.pid)
    if ps -p $PID > /dev/null; then
        kill $PID
        echo "✔️ Aplicación detenida (PID: $PID)."
    else
        echo "⚠️ PID $PID no encontrado o ya no está en ejecución."
    fi
    rm -f "/var/run/${appName}.pid"
else
    echo "⚠️ Archivo PID no encontrado. La aplicación podría no estar corriendo o el PID no fue registrado."
fi
`;

  try {
    const startAppPath = path.join(appInstallDir, 'start-app.sh');
    const stopAppPath = path.join(appInstallDir, 'stop-app.sh');

    await fs.writeFile(startAppPath, startAppScriptContent);
    await fs.writeFile(stopAppPath, stopAppScriptContent);

    await fs.chmod(startAppPath, '0755');
    await fs.chmod(stopAppPath, '0755');

    console.log('✔️ Scripts start-app.sh y stop-app.sh creados y configurados como ejecutables.');
  } catch (error) {
    console.error('⚠️ Error al crear los scripts de la aplicación:', error);
    throw error;
  }
}

module.exports = createAppScripts;

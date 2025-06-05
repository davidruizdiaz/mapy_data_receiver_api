const fs = require('fs-extra'); // Usamos fs-extra para operaciones de archivos más sencillas
const path = require('path');

/**
 * Crea la estructura base del paquete .deb y copia los archivos de la aplicación.
 * @param {object} config - Objeto de configuración con appName, appVersion, projectRoot, distDir.
 */
async function createDebStructure(config) {
  const { appName, appVersion, projectRoot, distDir } = config;
  const debPackageDir = path.join(distDir, `${appName}_${appVersion}`);
  const appInstallDir = path.join(debPackageDir, 'opt', appName);
  const appProjectDir = path.join(appInstallDir, 'app'); // Directorio donde irá tu proyecto Node.js

  console.log(`📦 Creando estructura del paquete .deb en: ${debPackageDir}`);

  try {
    if (fs.existsSync(distDir)) {
      await fs.remove(distDir);
      console.log(`Directorio ${distDir} limpiado.`);
    }
    await fs.mkdirp(path.join(debPackageDir, 'DEBIAN'));
    await fs.mkdirp(appProjectDir);

    console.log('✔️ Estructura de directorios creada.');

    // Lista de archivos/directorios a copiar desde la raíz de tu proyecto
    const filesToCopy = [
      'src',
      'index.js',
      'package.json',
      'package-lock.json',
      '.env_example',
      'knexfile.js',
      'initdb.sh',
      'README.md',
    ];

    console.log('󱀫 Copiando archivos de la aplicación...');
    for (const file of filesToCopy) {
      const sourcePath = path.join(projectRoot, file);
      const destPath = path.join(appProjectDir, file);
      if (fs.existsSync(sourcePath)) {
        await fs.copy(sourcePath, destPath, { overwrite: true });
        console.log(`🆗 Copiado: ${file}`);
      } else {
        console.log(`❗Advertencia: El archivo/directorio '${file}' no existe en ${projectRoot}.`);
      }
    }

    console.log('✔️ Archivos de la aplicación copiados.');
  } catch (error) {
    console.error('⚠️ Error al crear la estructura del paquete .deb o copiar archivos:', error);
    throw error; // Propaga el error para que el orquestador lo maneje
  }
}

module.exports = createDebStructure;

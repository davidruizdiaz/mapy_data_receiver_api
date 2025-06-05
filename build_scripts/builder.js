const path = require('path');
const { exec } = require('child_process');
const fs = require('fs-extra');
const { name: appName, version: appVersion, description } = require('../package.json');


const createDebStructure = require('./createDebStructure');
const createAppScripts = require('./createAppScripts');
const createControlFiles = require('./createControlFiles');

const config = {
  appName,
  appVersion,
  description,
  maintainer: 'David Ruiz Diaz <adavidruizdiaz@gmail.com>',
  projectRoot: path.resolve(__dirname, '..'),
  distDir: path.resolve(__dirname, '../dist'),
  appUser: `${appName}_user`,
  appGroup: `${appName}_group`,
};

async function buildDebPackage() {
  console.log('⏳ Iniciando el proceso de construcción del paquete .deb...');
  console.log('󱁼 Configuración:', config);

  try {
    await createDebStructure(config);
    console.log('\n--- ✔️  Estructura del paquete creada y archivos copiados. ---');

    await createAppScripts(config);
    console.log('\n--- ✔️  Scripts de inicio/parada de la aplicación creados. ---');

    await createControlFiles(config);
    console.log('\n--- ✔️  Archivos de control del paquete creados. ---');

    const debPackageDir = path.join(config.distDir, `${config.appName}_${config.appVersion}`);
    console.log(`\nConstruyendo el archivo .deb desde: ${debPackageDir}`);

    const dpkgCommand = `dpkg-deb --build ${debPackageDir}`;
    console.log(`Ejecutando: ${dpkgCommand}`);

    const { stdout, stderr } = await new Promise((resolve, reject) => {
      exec(dpkgCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error al construir el .deb: ${error.message}`);
          console.error(`stderr: ${stderr}`);
          return reject(error);
        }
        if (stderr) {
          console.warn(`Advertencia de dpkg-deb: ${stderr}`);
        }
        console.log(`Salida de dpkg-deb: ${stdout}`);
        resolve({ stdout, stderr });
      });
    });

    const finalDebPath = path.join(config.distDir, `${config.appName}_${config.appVersion}.deb`);
    console.log(`\n✔️  ¡Paquete .deb creado exitosamente en: ${finalDebPath}!`);
    console.log('👉 Ahora puedes copiar este archivo a tu sistema Debian/Ubuntu e instalarlo con:');
    console.log(`sudo dpkg -i ${path.basename(finalDebPath)}`);
    console.log('Y para verificar el estado del servicio:');
    console.log(`systemctl status ${config.appName}.service`);

  } catch (error) {
    console.error('\n⚠️ ¡Error durante el proceso de construcción del paquete .deb!');
    console.error(error);
    process.exit(1); // Salir con código de error
  }
}

buildDebPackage();


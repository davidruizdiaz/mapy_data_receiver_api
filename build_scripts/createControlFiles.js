const fs = require('fs-extra');
const path = require('path');

/**
 * Crea los archivos de control del paquete .deb (control, postinst, prerm, postrm).
 * @param {object} config - Objeto de configuración con appName, appVersion, maintainer, distDir, appUser, appGroup.
 */
async function createControlFiles(config) {
  const { appName, appVersion, maintainer, distDir, description, appUser, appGroup, projectRoot } = config;
  const debPackageDir = path.join(distDir, `${appName}_${appVersion}`);
  const debianDir = path.join(debPackageDir, 'DEBIAN');
  const appInstallRoot = path.join('/opt', appName);
  const appProjectDir = path.join(appInstallRoot, 'app');

  console.log('⏳Creando archivos de control del paquete .deb...');

  const envExamplePath = path.join(projectRoot, '.env_example');
  let envVariables = [];
  try {
    const envExampleContent = await fs.readFile(envExamplePath, 'utf8');
    envVariables = envExampleContent.split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('C4_') || (line.length > 0 && line.includes('=')))
      .map(line => line.split('=')[0]);
    console.log(`Detectadas variables en .env_example para debconf: ${envVariables.join(', ')}`);
  } catch (error) {
    console.warn(`⚠️ Advertencia: No se pudo leer .env_example en ${envExamplePath}. Las preguntas de .env no se generarán automáticamente. Error:`, error.message);
  }

  const controlContent = `Package: ${appName.toLowerCase()}
Version: ${appVersion}
Section: net
Priority: optional
Architecture: all
Depends: debconf
Maintainer: ${maintainer}
Description: ${description}.
`;

  let templatesContent = '';
  envVariables.forEach(varName => {
    templatesContent += `Template: ${appName.toLowerCase()}/${varName.toLowerCase()}
Type: string
Description: ${varName}:
 Ingrese el valor para la variable de entorno ${varName}.

`;
  });

  const configContent = `#!/bin/bash
set -e
. /usr/share/debconf/confmodule

${envVariables.map(varName => `
db_input high ${appName.toLowerCase()}/${varName.toLowerCase()} || true
db_go || true
`).join('')}

exit 0
`;

  const postinstContent = `#!/bin/bash
. /usr/share/debconf/confmodule

APP_INSTALL_ROOT="${appInstallRoot}"
APP_PROJECT_DIR="${appProjectDir}"
APP_SERVICE_NAME="${appName}"
APP_USER="${appUser}"
APP_GROUP="${appGroup}"

if [ "$1" = "configure" ]; then
    echo "⏳Configurando la aplicación Node.js..."

    if ! id -g "$APP_GROUP" >/dev/null 2>&1; then
        echo "⏳Creando grupo '$APP_GROUP'..."
        groupadd "$APP_GROUP"
    fi

    if ! id -u "$APP_USER" >/dev/null 2>&1; then
        echo "⏳Creando usuario '$APP_USER'..."
        useradd -r -s /bin/false -g "$APP_GROUP" "$APP_USER"
    fi

    echo "⏳Estableciendo permisos y propietario para ${appInstallRoot}..."
    chown -R "$APP_USER":"$APP_GROUP" "$APP_INSTALL_ROOT"
    chmod -R 0750 "$APP_INSTALL_ROOT"

    if [ ! -f "$APP_PROJECT_DIR/.env" ]; then
        cp "$APP_PROJECT_DIR/.env_example" "$APP_PROJECT_DIR/.env"
        echo "✔️  Se ha creado el archivo .env a partir de .env_example."
    fi

    chown "$APP_USER":"$APP_GROUP" "$APP_PROJECT_DIR/.env"
    chmod 0640 "$APP_PROJECT_DIR/.env"

    echo "⏳Obteniendo variables de entorno de debconf..."
    ${envVariables.map(varName => `
    db_get ${appName.toLowerCase()}/${varName.toLowerCase()}
    USER_INPUT=$RET
    if [ -n "$USER_INPUT" ]; then
        ESCAPED_USER_INPUT=$(echo "$USER_INPUT" | sed 's/[\/&]/\\&/g')
        if grep -q "^${varName}=" "$APP_PROJECT_DIR/.env"; then
            sed -i "s/^${varName}=.*/${varName}=$ESCAPED_USER_INPUT/" "$APP_PROJECT_DIR/.env"
        else
            echo "${varName}=$ESCAPED_USER_INPUT" >> "$APP_PROJECT_DIR/.env"
        fi
    fi
    `).join('')}

    echo "✔️ Variables de entorno configuradas en $APP_PROJECT_DIR/.env"

    echo "⏳Creando el servicio systemd '$APP_SERVICE_NAME'..."
    cat > /etc/systemd/system/"$APP_SERVICE_NAME".service << EOF
[Unit]
Description=Servicio API HTTP de ${appName}
After=network.target

[Service]
ExecStart=/opt/${appName}/start-app.sh
ExecStop=/opt/${appName}/stop-app.sh
WorkingDirectory=${appProjectDir}
Restart=always
User=${appUser}
Group=${appGroup}

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable "$APP_SERVICE_NAME".service
    systemctl start "$APP_SERVICE_NAME".service

    echo "✔️  Servicio systemd '$APP_SERVICE_NAME' creado, habilitado e iniciado."

fi

exit 0
`;

  const prermContent = `#!/bin/bash

APP_SERVICE_NAME="${appName}"

if [ "$1" = "remove" ]; then
    echo "⏳Deteniendo y deshabilitando el servicio systemd '$APP_SERVICE_NAME'..."
    systemctl stop "$APP_SERVICE_NAME".service || true
    systemctl disable "$APP_SERVICE_NAME".service || true
    rm -f /etc/systemd/system/"$APP_SERVICE_NAME".service || true
    systemctl daemon-reload
    echo "✔️  '$APP_SERVICE_NAME' detenido"
fi

exit 0
`;

  const postrmContent = `#!/bin/bash

APP_PROJECT_DIR="${appProjectDir}"
APP_USER="${appUser}"
APP_GROUP="${appGroup}"

if [ "$1" = "purge" ]; then
    echo "⏳Eliminando archivos de configuración de '${appName}'..."
    rm -f "$APP_PROJECT_DIR/.env" || true
    # Opcional: Eliminar usuario y grupo solo si no son utilizados por nadie más
    # Esto es delicado y solo se recomienda si estás seguro de que el usuario/grupo
    # no se usa para nada más.
    # userdel "$APP_USER" || true
    # groupdel "$APP_GROUP" || true
fi

exit 0
`;

  try {
    await fs.writeFile(path.join(debianDir, 'control'), controlContent);
    await fs.writeFile(path.join(debianDir, 'templates'), templatesContent); // Nuevo archivo
    await fs.writeFile(path.join(debianDir, 'config'), configContent);     // Nuevo archivo
    await fs.writeFile(path.join(debianDir, 'postinst'), postinstContent);
    await fs.writeFile(path.join(debianDir, 'prerm'), prermContent);
    await fs.writeFile(path.join(debianDir, 'postrm'), postrmContent);

    // Hacer los scripts de control ejecutables
    await fs.chmod(path.join(debianDir, 'config'), '0755');    // ¡Importante para config!
    await fs.chmod(path.join(debianDir, 'postinst'), '0755');
    await fs.chmod(path.join(debianDir, 'prerm'), '0755');
    await fs.chmod(path.join(debianDir, 'postrm'), '0755');

    console.log('✔️  Archivos de control del paquete .deb creados y configurados como ejecutables.');
  } catch (error) {
    console.error('⚠️ Error al crear los archivos de control:', error);
    throw error;
  }
}

module.exports = createControlFiles;

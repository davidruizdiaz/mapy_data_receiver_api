const fs = require('fs-extra');
const path = require('path');

/**
 * Crea los archivos de control del paquete .deb (control, postinst, prerm, postrm).
 * @param {object} config - Objeto de configuración con appName, appVersion, maintainer, distDir.
 */
async function createControlFiles(config) {
  const {
    appName,
    appVersion,
    maintainer,
    distDir,
    description,
    appUser,
    appGroup
  } = config;
  const debPackageDir = path.join(distDir, `${appName}_${appVersion}`);
  const debianDir = path.join(debPackageDir, 'DEBIAN');
  const appProjectDir = path.join('/opt', appName, 'app');
  const appInstallRoot = path.join('/opt', appName);

  console.log('⏳Creando archivos de control del paquete .deb...');

  const controlContent = `Package: ${appName}
Version: ${appVersion}
Section: net
Priority: optional
Architecture: all
Depends: nodejs (>= 16.0.0), npm | yarn
Maintainer: ${maintainer}
Description: ${description}.
`;

  const postinstContent = `#!/bin/bash

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

    echo "👉 Por favor, introduce los valores para las siguientes variables de entorno.
    Si dejas el campo vacío, se mantendrá el valor actual (o quedará en blanco si no hay valor)."
    
    while IFS= read -r line; do
        if [[ "$line" =~ ^[A-Z_0-9]+= ]]; then
            VAR_NAME=$(echo "$line" | cut -d'=' -f1)
            CURRENT_VALUE=$(grep "^$VAR_NAME=" "$APP_PROJECT_DIR/.env" | cut -d'=' -f2-)
            
            CLEAN_CURRENT_VALUE=$(echo "$CURRENT_VALUE" | sed -e 's/^"//' -e 's/"$//')

            read -p "Introduce el valor para $VAR_NAME (actual: '$CLEAN_CURRENT_VALUE'): " USER_INPUT
            
            if [ -n "$USER_INPUT" ]; then
                ESCAPED_USER_INPUT=$(echo "$USER_INPUT" | sed 's/[\/&]/\\&/g')
                if grep -q "^$VAR_NAME=" "$APP_PROJECT_DIR/.env"; then
                    sed -i "s/^$VAR_NAME=.*/$VAR_NAME=$ESCAPED_USER_INPUT/" "$APP_PROJECT_DIR/.env"
                else
                    echo "$VAR_NAME=$ESCAPED_USER_INPUT" >> "$APP_PROJECT_DIR/.env"
                fi
            fi
        fi
    done < "$APP_PROJECT_DIR/.env_example"

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

if [ "$1" = "purge" ]; then
    echo "⏳Eliminando archivos de configuración de '${appName}'..."
    rm -f "$APP_PROJECT_DIR/.env" || true
fi

exit 0
`;

  try {
    await fs.writeFile(path.join(debianDir, 'control'), controlContent);
    await fs.writeFile(path.join(debianDir, 'postinst'), postinstContent);
    await fs.writeFile(path.join(debianDir, 'prerm'), prermContent);
    await fs.writeFile(path.join(debianDir, 'postrm'), postrmContent);

    // Hacer los scripts de control ejecutables
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

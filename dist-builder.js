const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");

const DIST_DIR = path.join(__dirname, "dist");

async function buildDist() {
  console.log("🚀 Iniciando empaquetado de distribución...");

  if (fs.existsSync(DIST_DIR)) {
    console.log("🧹 Eliminando carpeta dist anterior...");
    fse.removeSync(DIST_DIR);
  }

  fse.mkdirSync(DIST_DIR);

  const filesToCopy = ["index.js", "knexfile.js", ".env", "app.ico",];
  const foldersToCopy = ["src"];

  filesToCopy.forEach((file) => {
    const src = path.join(__dirname, file);
    const dest = path.join(DIST_DIR, file);
    if (fs.existsSync(src)) {
      fse.copySync(src, dest);
      console.log(`📄 Copiado: ${file}`);
    }
  });

  foldersToCopy.forEach((folder) => {
    const src = path.join(__dirname, folder);
    const dest = path.join(DIST_DIR, folder);
    if (fs.existsSync(src)) {
      fse.copySync(src, dest);
      console.log(`📁 Copiado: ${folder}/`);
    }
  });

  const originalPkg = require("./package.json");
  const prodPkg = {
    name: originalPkg.name,
    version: originalPkg.version,
    description: originalPkg.description,
    main: originalPkg.main,
    scripts: {
      start: "node index.js",
    },
    dependencies: originalPkg.dependencies,
  };
  fs.writeFileSync(
    path.join(DIST_DIR, "package.json"),
    JSON.stringify(prodPkg, null, 2)
  );
  console.log("📦 package.json de producción generado");

  const run = `@echo off
cd /d %~dp0
node index.js
pause`;

  fs.writeFileSync(path.join(DIST_DIR, "run.bat"), run);
  console.log("🟢 Script de inicio creado");

  console.log("📥 Instalando dependencias de producción...");
  execSync("npm install --production", { cwd: DIST_DIR, stdio: "inherit" });
}

buildDist().catch((err) => {
  console.error("❌ Error durante el empaquetado:", err);
});

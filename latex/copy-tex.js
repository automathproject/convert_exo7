const fs = require('fs');
const path = require('path');

// Répertoire source et destination
const srcDir = path.join(__dirname, 'src');
const rootDir = __dirname;

// Fonction pour copier un fichier
function copyFile(source, destination) {
  fs.copyFileSync(source, destination);
  console.log(`Copié : ${source} -> ${destination}`);
}

// Fonction récursive pour parcourir les répertoires
function traverseDirectory(currentDir) {
  const files = fs.readdirSync(currentDir);

  files.forEach(file => {
    const filePath = path.join(currentDir, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      // Si c'est un répertoire, on continue la recherche
      if (filePath !== srcDir) {
        traverseDirectory(filePath);
      }
    } else if (stats.isFile() && path.extname(filePath) === '.tex') {
      // Si c'est un fichier .tex, on le copie dans src/
      const destPath = path.join(srcDir, path.basename(filePath));
      copyFile(filePath, destPath);
    }
  });
}

// Lancer la recherche à partir du répertoire racine
traverseDirectory(rootDir);

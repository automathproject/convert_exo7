const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'latex'); // Répertoire de base

function processFile(filePath) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Erreur de lecture du fichier : ${filePath}`, err);
            return;
        }

        const lines = data.split('\n');
        let modified = false;

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].match(/\\auteur\{.*\}/)) {
                if (i + 1 < lines.length && lines[i + 1].includes('\\organisation')) {
                    return; // La ligne \organisation existe déjà, ne rien modifier
                }
                lines.splice(i + 1, 0, '\\organisation{exo7}');
                modified = true;
                break; // On modifie une seule occurrence par fichier
            }
        }

        if (modified) {
            fs.writeFile(filePath, lines.join('\n'), 'utf8', (err) => {
                if (err) {
                    console.error(`Erreur d'écriture du fichier : ${filePath}`, err);
                } else {
                    console.log(`Modifié : ${filePath}`);
                }
            });
        }
    });
}

function scanDirectory(dir) {
    fs.readdir(dir, { withFileTypes: true }, (err, files) => {
        if (err) {
            console.error(`Erreur de lecture du répertoire : ${dir}`, err);
            return;
        }

        files.forEach(file => {
            const fullPath = path.join(dir, file.name);
            if (file.isDirectory()) {
                scanDirectory(fullPath); // Appel récursif pour les sous-répertoires
            } else if (file.isFile() && fullPath.endsWith('.tex')) {
                processFile(fullPath);
            }
        });
    });
}

scanDirectory(directory);

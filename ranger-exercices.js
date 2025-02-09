const fs = require('fs');
const path = require('path');

// Chemin vers le fichier JSON contenant les exercices
const exercisesFilePath = 'structure/exercices.json';

// Chemin vers le répertoire contenant les fichiers .tex
const texFilesDirectory = 'oymv2';

// Lire le fichier JSON
const exercisesData = JSON.parse(fs.readFileSync(exercisesFilePath, 'utf8'));

// Parcourir chaque exercice
exercisesData.forEach(exercise => {
  const { uuid, moduleId, niveau } = exercise;
  const texFileName = `${uuid}.tex`;
  const texFilePath = path.join(texFilesDirectory, texFileName);

  // Vérifier si le fichier .tex existe
  if (fs.existsSync(texFilePath)) {
    // Vérifier si les informations du module et du niveau sont présentes
    if (moduleId && niveau) {
      // Créer le répertoire de destination s'il n'existe pas
      const destinationDirectory = path.join(texFilesDirectory, `${moduleId}-${niveau}`);
      if (!fs.existsSync(destinationDirectory)) {
        fs.mkdirSync(destinationDirectory);
      }

      // Déplacer le fichier .tex vers le répertoire de destination
      const destinationFilePath = path.join(destinationDirectory, texFileName);
      fs.renameSync(texFilePath, destinationFilePath);
      console.log(`Moved ${texFileName} to ${destinationDirectory}`);
    } else {
      console.log(`Module or level information missing for ${texFileName}. File remains in root directory.`);
    }
  } else {
    console.log(`File ${texFileName} does not exist.`);
  }
});
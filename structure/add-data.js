// Charger le module 'fs' pour lire/écrire les fichiers
const fs = require('fs');

// Lire et parser les fichiers JSON
const modulesChapitres = JSON.parse(fs.readFileSync('modules-chapitres.json', 'utf8'));
const exercices = JSON.parse(fs.readFileSync('exercices.json', 'utf8'));

// Pour chaque exercice, on cherche le module correspondant
exercices.forEach(exercice => {
  const sousChapitreCode = exercice.sousChapitre;

  // Initialiser la variable qui contiendra le module trouvé
  let moduleTrouve = null;

  // Parcourir les modules
  for (const module of modulesChapitres) {
    // Parcourir chacun des chapitres du module
    for (const chapitre of module.chapitres) {
      // Vérifier si un des sous-chapitres correspond au code recherché
      const sousChapitre = chapitre.sousChapitres.find(sc => sc.code === sousChapitreCode);
      if (sousChapitre) {
        moduleTrouve = module;
        break; // on sort de la boucle des chapitres
      }
    }
    if (moduleTrouve) break; // on sort de la boucle des modules si le module a été trouvé
  }

  if (moduleTrouve) {
    // Ajouter les informations du module dans l'objet exercice
    exercice.moduleId = moduleTrouve.id;
    exercice.niveau = moduleTrouve.niveau;
    exercice.moduleDescription = moduleTrouve.description;
  } else {
    console.warn(`Aucun module trouvé pour le sous-chapitre ${sousChapitreCode}`);
  }
});

// Afficher le résultat (par exemple dans la console)
//console.log(JSON.stringify(exercices, null, 2));

// Si vous souhaitez sauvegarder le résultat dans un nouveau fichier, décommentez ce code :
fs.writeFileSync('exercices-avec-module.json', JSON.stringify(exercices, null, 2));

const fs = require('fs');

// Fonction pour parser le fichier des exercices avec auteurs et dates
function parseExercicesInfo(content) {
    const insertRegex = /INSERT INTO `exercices` VALUES\s*\((.*?)\);/s;
    const match = content.match(insertRegex);
    
    if (!match) {
        throw new Error("Aucune donnée INSERT trouvée pour les exercices");
    }
    
    const valuesString = match[1];
    const rowRegex = /\((\d+),'([^']+)','([^']+)','([YN])','([YN])'\)/g;
    const exercices = new Map();
    let rowMatch;
    
    while ((rowMatch = rowRegex.exec(valuesString)) !== null) {
        exercices.set(parseInt(rowMatch[1]), {
            exo7id: parseInt(rowMatch[1]),
            auteur: rowMatch[2],
            datecreate: rowMatch[3],
            isindication: rowMatch[4] === 'Y',
            iscorrection: rowMatch[5] === 'Y'
        });
    }
    
    return exercices;
}

// Fonction pour parser le fichier des exercices avec leurs chapitres
function parseExercicesChapitres(content) {
    const insertRegex = /INSERT INTO `exercices_motscles` VALUES\s*\((.*?)\);/s;
    const match = content.match(insertRegex);
    
    if (!match) {
        throw new Error("Aucune donnée INSERT trouvée pour les chapitres des exercices");
    }
    
    const valuesString = match[1];
    const rowRegex = /\((\d+),(\d+\.\d+),'([YN])'\)/g;
    const chapitres = new Map();
    let rowMatch;
    
    while ((rowMatch = rowRegex.exec(valuesString)) !== null) {
        const exoId = parseInt(rowMatch[1]);
        // Utilise toFixed(2) pour conserver exactement 2 décimales
        const sousChapitreCode = parseFloat(rowMatch[2]).toFixed(2);
        chapitres.set(exoId, sousChapitreCode);
    }
    
    return chapitres;
}

// Fonction principale qui combine les données
function createExercicesJson() {
    // Lecture des fichiers
    const exercicesContent = fs.readFileSync('exercices-auteur-date.sql', 'utf8');
    const chapitresContent = fs.readFileSync('exercices-chapitres.sql', 'utf8');
    
    // Parse les deux fichiers
    const exercices = parseExercicesInfo(exercicesContent);
    const chapitres = parseExercicesChapitres(chapitresContent);
    
    // Combine les informations
    const resultats = [];
    exercices.forEach((exercice, id) => {
        const sousChapitreCode = chapitres.get(id);
        if (sousChapitreCode) {
            exercice.sousChapitre = sousChapitreCode;
            resultats.push(exercice);
        }
    });
    
    return resultats;
}

// Exécution et sauvegarde
try {
    const jsonData = createExercicesJson();
    // Utilise un replacer pour conserver les chaînes de caractères pour les nombres décimaux
    fs.writeFileSync('exercices.json', JSON.stringify(jsonData, null, 2));
    console.log('Conversion terminée. Les données ont été sauvegardées dans exercices.json');
    
    // Affiche un exemple pour vérification
    console.log('Exemple des trois premiers exercices convertis :');
    console.log(JSON.stringify(jsonData.slice(0, 3), null, 2));
} catch (error) {
    console.error('Erreur lors de la conversion :', error.message);
}
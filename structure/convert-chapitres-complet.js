const fs = require('fs');

// Fonction pour parser le fichier des chapitres
function parseChapitres(content) {
    const insertRegex = /INSERT INTO `chapitres` VALUES\s*\((.*?)\);/s;
    const match = content.match(insertRegex);
    
    if (!match) {
        throw new Error("Aucune donnée INSERT trouvée pour les chapitres");
    }
    
    const valuesString = match[1];
    const rowRegex = /\((\d+),'([^']+)'\)/g;
    const chapitres = [];
    let rowMatch;
    
    while ((rowMatch = rowRegex.exec(valuesString)) !== null) {
        chapitres.push({
            id: parseInt(rowMatch[1]),
            titre: rowMatch[2],
            sousChapitres: [] // Initialise un tableau vide pour les sous-chapitres
        });
    }
    
    return chapitres;
}

// Fonction pour parser le fichier des sous-chapitres
function parseSousChapitres(content) {
    const insertRegex = /INSERT INTO `motscles` VALUES\s*\((.*?)\);/s;
    const match = content.match(insertRegex);
    
    if (!match) {
        throw new Error("Aucune donnée INSERT trouvée pour les sous-chapitres");
    }
    
    const valuesString = match[1];
    const rowRegex = /\((\d+\.\d+),'([^']+)'\)/g;
    const sousChapitres = [];
    let rowMatch;
    
    while ((rowMatch = rowRegex.exec(valuesString)) !== null) {
        const code = parseFloat(rowMatch[1]).toFixed(2);  // Force le format à 2 décimales
        sousChapitres.push({
            code: code,  // Garde la chaîne de caractères avec .00
            description: rowMatch[2]
        });
    }
    
    return sousChapitres;
}

// Fonction principale qui combine les deux
function createNestedJson() {
    // Lecture des fichiers
    const chapitresContent = fs.readFileSync('chapitres.sql', 'utf8');
    const sousChapitresContent = fs.readFileSync('souschapitres.sql', 'utf8');
    
    // Parse les deux fichiers
    const chapitres = parseChapitres(chapitresContent);
    const sousChapitres = parseSousChapitres(sousChapitresContent);
    
    // Associe chaque sous-chapitre à son chapitre parent
    sousChapitres.forEach(sousChap => {
        const parentId = Math.floor(parseFloat(sousChap.code)); // Convertit le code en nombre pour extraire la partie entière
        const chapitre = chapitres.find(chap => chap.id === parentId);
        if (chapitre) {
            chapitre.sousChapitres.push(sousChap);
        }
    });
    
    // Trie les sous-chapitres par code dans chaque chapitre
    chapitres.forEach(chapitre => {
        chapitre.sousChapitres.sort((a, b) => parseFloat(a.code) - parseFloat(b.code));
    });
    
    return chapitres;
}

// Exécution et sauvegarde
try {
    const jsonData = createNestedJson();
    fs.writeFileSync('chapitres_complet.json', JSON.stringify(jsonData, null, 2));
    console.log('Conversion terminée. Les données ont été sauvegardées dans chapitres_complet.json');
    
    // Affiche un exemple pour vérification
    console.log('Exemple du premier chapitre converti :');
    console.log(JSON.stringify(jsonData[0], null, 2));
} catch (error) {
    console.error('Erreur lors de la conversion :', error.message);
}
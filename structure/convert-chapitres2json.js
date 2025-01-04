const fs = require('fs');

// Lecture du fichier SQL
const sqlContent = fs.readFileSync('chapitres.sql', 'utf8');

// Fonction pour parser le contenu SQL
function sqlToJson(sqlContent) {
    // Recherche la partie INSERT INTO avec une regex plus précise
    const insertRegex = /INSERT INTO `chapitres` VALUES\s*\((.*?)\);/s;
    const match = sqlContent.match(insertRegex);
    
    if (!match) {
        throw new Error("Aucune donnée INSERT trouvée");
    }
    
    // Extrait les valeurs
    const valuesString = match[1];
    
    // Utilise une regex pour trouver toutes les paires (id,'titre')
    const rowRegex = /\((\d+),'([^']+)'\)/g;
    const rows = [];
    let rowMatch;
    
    while ((rowMatch = rowRegex.exec(valuesString)) !== null) {
        rows.push({
            id: parseInt(rowMatch[1]),
            titre: rowMatch[2]
        });
    }
    
    return rows;
}

// Conversion des données
const jsonData = sqlToJson(sqlContent);

// Sauvegarde du résultat dans un fichier JSON
fs.writeFileSync('chapitres.json', JSON.stringify(jsonData, null, 2));

console.log('Conversion terminée. Les données ont été sauvegardées dans chapitres.json');

// Affiche les premières entrées pour vérification
console.log('Premières entrées converties :');
console.log(JSON.stringify(jsonData.slice(0, 3), null, 2));
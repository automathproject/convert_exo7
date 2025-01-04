const fs = require('fs');

function parseAuteurs(content) {
    // Trouve la section INSERT
    const insertPart = content.split('INSERT INTO `auteurs` VALUES')[1];
    if (!insertPart) {
        throw new Error("Section INSERT non trouvée");
    }
    
    // Extrait toutes les valeurs jusqu'au point-virgule
    const valuesSection = insertPart.split(';')[0];
    
    // Expression régulière pour capturer chaque ensemble de valeurs
    const rowRegex = /\('([^']+)',(?:'([^']+)'|NULL),(?:'([^']+)'|NULL),(?:'([^']+)'|NULL)\)/g;
    const auteurs = [];
    let match;
    
    // Capture toutes les correspondances
    while ((match = rowRegex.exec(valuesSection)) !== null) {
        auteurs.push({
            pseudo: match[1],
            nom: match[2] || null,
            prenom: match[3] || null,
            email: match[4] || null
        });
    }
    
    return auteurs;
}

try {
    // Lecture du fichier SQL
    const content = fs.readFileSync('auteurs.sql', 'utf8');
    
    // Parse le contenu
    const jsonData = parseAuteurs(content);
    
    // Sauvegarde en JSON
    fs.writeFileSync('auteurs.json', JSON.stringify(jsonData, null, 2));
    console.log(`Conversion terminée. ${jsonData.length} auteurs ont été sauvegardés dans auteurs.json`);
    
    // Affiche quelques exemples pour vérification
    console.log('\nPremiers et derniers auteurs convertis :');
    console.log('Premiers auteurs :', JSON.stringify(jsonData.slice(0, 3), null, 2));
    if (jsonData.length > 3) {
        console.log('Derniers auteurs :', JSON.stringify(jsonData.slice(-3), null, 2));
    }
} catch (error) {
    console.error('Erreur lors de la conversion :', error.message);
}
const fs = require('fs');

// Fonction pour générer un UUID alphanumérique de 4 caractères
function generateUUID() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Fonction pour vérifier si un UUID est unique
function isUUIDUnique(uuid, usedUUIDs) {
    return !usedUUIDs.has(uuid);
}

// Fonction principale
function main() {
    try {
        // Lire le fichier themes.json
        const data = JSON.parse(fs.readFileSync('themes.json', 'utf-8'));
        
        // Ensemble pour stocker les UUIDs déjà utilisés
        const usedUUIDs = new Set();
        
        // Ajouter un UUID unique à chaque entrée
        const updatedData = data.map(entry => {
            let uuid;
            do {
                uuid = generateUUID();
            } while (!isUUIDUnique(uuid, usedUUIDs));
            
            usedUUIDs.add(uuid);
            
            return {
                ...entry,
                uuid: uuid
            };
        });
        
        // Sauvegarder le résultat dans un nouveau fichier
        const outputPath = 'themes_with_uuid.json';
        fs.writeFileSync(outputPath, JSON.stringify(updatedData, null, 2));
        console.log(`Traitement terminé. Résultats sauvegardés dans ${outputPath}`);
        console.log(`Nombre d'entrées traitées: ${updatedData.length}`);

    } catch (error) {
        console.error('Erreur lors du traitement:', error.message);
        process.exit(1);
    }
}

main();

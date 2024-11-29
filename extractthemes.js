const fs = require('fs');
const path = require('path');

// Fonction pour formatter l'UUID
function formatUUID(num) {
    return `ex${num.toString().padStart(6, '0')}`;
}

// Fonction pour parser les numéros dans une insertion
function parseNumbers(insertion) {
    const numbers = [];
    const parts = insertion.split(',').map(part => part.trim());
    
    for (const part of parts) {
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(num => parseInt(num));
            for (let i = start; i <= end; i++) {
                numbers.push(i);
            }
        } else {
            numbers.push(parseInt(part));
        }
    }
    
    return numbers;
}

// Fonction pour extraire les thèmes et insertions d'un fichier
function parseFile(content) {
    const results = [];
    let mainTheme = null;
    let currentThemes = [];
    
    // Expression régulière pour capturer les différents éléments
    const regex = /\\(titre|section|insertion)\{([^}]+)\}/g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
        const [, type, value] = match;
        
        switch (type) {
            case 'titre':
                mainTheme = value;
                currentThemes = [mainTheme];
                break;
            case 'section':
                currentThemes = [mainTheme, value];
                break;
            case 'insertion':
                const numbers = parseNumbers(value);
                for (const num of numbers) {
                    results.push({
                        uuid: formatUUID(num),
                        // Utiliser un Set pour supprimer les doublons, puis reconvertir en tableau
                        themes: [...new Set(currentThemes)]
                    });
                }
                break;
        }
    }
    
    return results;
}

// Fonction principale
async function main() {
    if (process.argv.length < 3) {
        console.error('Usage: node convert.js <input_directory>');
        process.exit(1);
    }

    const inputDir = process.argv[2];
    const allResults = [];

    try {
        // Lire tous les fichiers du répertoire
        const files = fs.readdirSync(inputDir)
            .filter(file => file.match(/^fic\d+\.txt$/))
            .sort();

        // Traiter chaque fichier
        for (const file of files) {
            const filePath = path.join(inputDir, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            const fileResults = parseFile(content);
            allResults.push(...fileResults);
        }

        // Créer le fichier JSON de sortie
        const outputPath = 'themes.json';
        fs.writeFileSync(outputPath, JSON.stringify(allResults, null, 2));
        console.log(`Traitement terminé. Résultats sauvegardés dans ${outputPath}`);

    } catch (error) {
        console.error('Erreur lors du traitement:', error.message);
        process.exit(1);
    }
}

main();
const fs = require('fs').promises;
const path = require('path');

function findChapterInfo(chapitres, code) {
    const chapterCode = code.split('.')[0];
    const subChapterCode = code;
    const chapter = chapitres.find(c => c.id === parseInt(chapterCode));
    if (!chapter) return null;
    const subChapter = chapter.sousChapitres.find(sc => sc.code === subChapterCode);
    if (!subChapter) return null;
    return {
        chapitre: chapter.titre,
        sousChapitre: subChapter.description
    };
}

async function processFiles() {
    try {
        const chapitresContent = await fs.readFile('structure/chapitres_complet.json', 'utf8');
        const exercicesContent = await fs.readFile('structure/exercices.json', 'utf8');
        const chapitres = JSON.parse(chapitresContent);
        const exercices = JSON.parse(exercicesContent);

        for (const exercice of exercices) {
            const texFilePath = path.join('oymv2', `${exercice.exo7id}.tex`);
            try {
                try {
                    await fs.access(texFilePath);
                } catch (error) {
                    console.log(`Le fichier ${texFilePath} n'existe pas, on continue avec le suivant`);
                    continue;
                }

                const texContent = await fs.readFile(texFilePath, 'utf8');
                const chapterInfo = findChapterInfo(chapitres, exercice.sousChapitre);
                
                if (!chapterInfo) {
                    console.log(`Impossible de trouver les informations pour l'exercice ${exercice.exo7id}`);
                    continue;
                }

                // Diviser le contenu en sections
                let lines = texContent.split('\n');

                // Supprimer les anciennes informations si elles existent
                lines = lines.filter(line => {
                    const trimmedLine = line.trim();
                    return !(
                        trimmedLine.startsWith('\\isIndication{') ||
                        trimmedLine.startsWith('\\isCorrection{') ||
                        trimmedLine.startsWith('\\chapitre{') ||
                        trimmedLine.startsWith('\\sousChapitre{')
                    );
                });

                // Préparer les nouvelles lignes
                const newLines = [
                    `\\isIndication{${exercice.isindication}}`,
                    `\\isCorrection{${exercice.iscorrection}}`,
                    `\\chapitre{${chapterInfo.chapitre}}`,
                    `\\sousChapitre{${chapterInfo.sousChapitre}}`
                ];

                // Insérer les nouvelles lignes après la troisième ligne
                lines.splice(3, 0, ...newLines);

                // Reconstruire le contenu
                const newContent = lines.join('\n');

                // Écrire le nouveau contenu dans le fichier
                await fs.writeFile(texFilePath, newContent);
                //console.log(`Fichier ${texFilePath} modifié avec succès`);

            } catch (error) {
                console.error(`Erreur lors du traitement du fichier ${texFilePath}:`, error);
            }
        }
        console.log('Traitement terminé');
    } catch (error) {
        console.error('Erreur lors du traitement des fichiers:', error);
    }
}

processFiles();
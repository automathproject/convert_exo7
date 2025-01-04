import fs from 'fs/promises';

async function generateModulesChapitres() {
    try {
        // Lire les fichiers d'entrée
        const chapitresContent = await fs.readFile('chapitres_complet.json', 'utf8');
        const chapitres = JSON.parse(chapitresContent);
        
        // Extraire les informations des modules depuis le fichier SQL
        const modulesContent = await fs.readFile('modules.sql', 'utf8');
        
        // Extraire la ligne INSERT avec toutes les valeurs
        const insertLine = modulesContent.match(/INSERT INTO `modules` VALUES\s*([\s\S]*?);/);
        if (!insertLine) {
            throw new Error("Aucune donnée de module trouvée dans le fichier SQL");
        }
        
        // Extraire toutes les entrées entre parenthèses
        const moduleEntries = insertLine[1].match(/\((.*?)\)/g);
        if (!moduleEntries) {
            throw new Error("Aucune entrée de module trouvée");
        }
        
        const modules = [];
        
        // Traiter chaque entrée de module
        moduleEntries.forEach(entry => {
            // Enlever les parenthèses et split les valeurs
            const values = entry.slice(1, -1).split(',').map(v => 
                v.trim().replace(/^'|'$/g, '') // Enlever les guillemets simples au début et à la fin
            );
            
            const [id, niveau, description, debChapitre, finChapitre] = values;
            
            // Trouver les chapitres correspondants
            const chapitresModule = chapitres.filter(chapitre => {
                const chapitreId = chapitre.id;
                return chapitreId >= parseInt(debChapitre) && chapitreId <= parseInt(finChapitre);
            });
            
            // Créer l'objet module avec ses chapitres
            const moduleObj = {
                id: parseInt(id),
                niveau: niveau,
                description: description,
                chapitres: chapitresModule.map(chapitre => ({
                    id: chapitre.id,
                    description: chapitre.titre,
                    sousChapitres: chapitre.sousChapitres
                }))
            };
            
            modules.push(moduleObj);
        });
        
        // Trier les modules par ID
        modules.sort((a, b) => a.id - b.id);
        
        // Écrire le fichier de sortie
        await fs.writeFile(
            'modules-chapitres.json',
            JSON.stringify(modules, null, 2),
            'utf8'
        );
        
        console.log('Le fichier modules-chapitres.json a été généré avec succès');
        
    } catch (error) {
        console.error('Erreur lors de la génération du fichier:', error);
    }
}

generateModulesChapitres();
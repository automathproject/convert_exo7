const fs = require('fs');
const path = require('path');

// Lecture du fichier JSON contenant les exercices.
// On suppose que le fichier JSON est un tableau d'objets.
const exercicesJson = JSON.parse(fs.readFileSync('structure/exercices.json', 'utf8'));

// Création d'une Map associant exo7id (clé) à uuid (valeur)
const exercicesMap = new Map(exercicesJson.map(e => [e.exo7id, e.uuid]));

// Lecture de la liste des fichiers dans le répertoire 'oymv2'
const files = fs.readdirSync('oymv2');
files.forEach(file => {
    // On ne traite que les fichiers se terminant par .tex
    if (file.endsWith('.tex')) {
        const filePath = path.join('oymv2', file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Extraction de l'identifiant depuis le nom du fichier.
        // Par exemple, "3.tex" donnera l'id 3.
        const id = parseInt(path.basename(file, '.tex'), 10);
        const uuid = exercicesMap.get(id);
        
        if (uuid) {
            // Insertion de la ligne \uuid{...} en tête du contenu du fichier
            const newContent = `\\uuid{${uuid}}\n${content}`;
            fs.writeFileSync(filePath, newContent);
            console.log(`UUID ajouté dans ${file} : ${uuid}`);
        } else {
            console.log(`Aucun UUID trouvé pour le fichier ${file}`);
        }
    }
});

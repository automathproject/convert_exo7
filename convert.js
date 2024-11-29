const fs = require('fs');
const path = require('path');

function processEnumerateItem(text, isQuestion) {
    if (text.includes('\\begin{enumerate}')) {
        const parts = text.split('\\begin{enumerate}');
        const beforeEnum = parts[0].trim();
        
        const enumMatch = text.match(/\\begin{enumerate}([\s\S]*?)\\end{enumerate}/);
        if (!enumMatch) {
            console.warn("Structure enumerate incomplète détectée");
            return isQuestion ? `\\question{${text}}` : `\\reponse{${text}}`;
        }
        
        const enumContent = enumMatch[1];
        const items = extractEnumerateItems(enumContent);
        
        if (isQuestion) {
            return `${beforeEnum ? `\\texte{${beforeEnum}}` : ''}
\\begin{enumerate}
${items.map(item => `  \\item \\question{${item}}`).join('\n')}
\\end{enumerate}`;
        }
        else {
            return `${beforeEnum ? `\\reponse{${beforeEnum}}` : ''}
\\begin{enumerate}
${items.map(item => `  \\item \\reponse{${item}}`).join('\n')}
\\end{enumerate}`;
        }
    }
    return isQuestion ? `\\question{${text}}` : `\\reponse{${text}}`;
}

function extractEnumerateItems(text) {
    if (!text) return [];
    
    const items = [];
    const itemRegex = /\\item\s*(.*?)(?=\\item|\\end{enumerate}|$)/gs;
    let match;
    
    while ((match = itemRegex.exec(text)) !== null) {
        if (match[1]) {
            items.push(match[1].trim());
        }
    }
    
    return items;
}

function convertLatexFormat(oldFormat) {
    const exerciceRegex = /\\exercice{([^}]+)}/;
    const match = oldFormat.match(exerciceRegex);
    let id, auteur, date;
    
    if (!match) {
        console.error("Format d'exercice non reconnu");
        return oldFormat;
    }
    
    const [idStr, auteurStr, dateStr] = match[1].split(',').map(s => s.trim());
    id = idStr;
    auteur = auteurStr;
    date = dateStr;

    const enonceRegex = /\\enonce(?:\[(.*?)\])?\s*([\s\S]*?)\\finenonce/;
    const enonceMatch = oldFormat.match(enonceRegex);
    
    if (!enonceMatch) {
        console.error("Structure d'énoncé non reconnue");
        return oldFormat;
    }

    const titre = enonceMatch[1] ? enonceMatch[1] : `Exercice ${id}`;
    const enonce = enonceMatch[2] ? enonceMatch[2].trim() : '';
    
    const hasEnumerate = enonce.includes('\\begin{enumerate}');
    
    if (hasEnumerate) {
        const beforeEnumerate = enonce.split('\\begin{enumerate}')[0].trim();
        
        const questionsPart = enonce.match(/\\begin{enumerate}([\s\S]*?)\\end{enumerate}/);
        let questions = [];
        if (questionsPart && questionsPart[1]) {
            questions = extractEnumerateItems(questionsPart[1]);
        }
        
        const processedQuestions = questions.map(q => {
            try {
                return `  \\item ${processEnumerateItem(q, true)}`;
            } catch (error) {
                console.warn(`Erreur lors du traitement d'une question: ${error.message}`);
                return `  \\item \\question{${q}}`;
            }
        });

        let processedResponses = [];
        const correctionRegex = /\\correction\s*([\s\S]*?)\\fincorrection/;
        const correctionMatch = oldFormat.match(correctionRegex);
        
        if (correctionMatch && !oldFormat.includes('\\nocorrection')) {
            const correctionPart = correctionMatch[1].match(/\\begin{enumerate}([\s\S]*?)\\end{enumerate}/);
            if (correctionPart && correctionPart[1]) {
                const responses = extractEnumerateItems(correctionPart[1]);
                processedResponses = responses.map(r => {
                    try {
                        return `  \\item ${processEnumerateItem(r, false)}`;
                    } catch (error) {
                        console.warn(`Erreur lors du traitement d'une réponse: ${error.message}`);
                        return `  \\item \\reponse{${r}}`;
                    }
                });
            }
        }

        return `\\uuid{${id}}
\\titre{${titre}}
\\theme{}
\\auteur{${auteur}}
\\date{${date}}
\\organisation{exo7}
\\contenu{
  \\texte{${beforeEnumerate}}
\\begin{enumerate}
${processedQuestions.join('\n')}
\\end{enumerate}
\\begin{enumerate}
${processedResponses.join('\n')}
\\end{enumerate}
}`;
    } else {
        let reponse = '';
        const correctionRegex = /\\correction\s*([\s\S]*?)\\fincorrection/;
        const correctionMatch = oldFormat.match(correctionRegex);
        
        if (correctionMatch && !oldFormat.includes('\\nocorrection')) {
            reponse = correctionMatch[1].trim();
        }

        return `\\uuid{${id}}
\\titre{${titre}}
\\theme{}
\\auteur{${auteur}}
\\date{${date}}
\\organisation{exo7}
\\contenu{
  \\texte{}
  \\question{${enonce}}
  \\reponse{${reponse}}
}`;
    }
}

function processFiles(inputDir, outputDir) {
    if (!fs.existsSync(inputDir)) {
        console.error(`Le répertoire d'entrée ${inputDir} n'existe pas`);
        process.exit(1);
    }

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const files = fs.readdirSync(inputDir);
    let successCount = 0;
    let errorCount = 0;
    
    files.filter(file => file.endsWith('.txt')).forEach(file => {
        const inputPath = path.join(inputDir, file);
        const outputFile = file.replace('.txt', '.tex');
        const outputPath = path.join(outputDir, outputFile);

        try {
            const content = fs.readFileSync(inputPath, 'utf8');
            const convertedContent = convertLatexFormat(content);
            fs.writeFileSync(outputPath, convertedContent);
            console.log(`Converti avec succès: ${file} -> ${outputFile}`);
            successCount++;
        } catch (error) {
            console.error(`Erreur lors du traitement de ${file}:`, error);
            errorCount++;
        }
    });

    console.log(`\nConversion terminée. ${successCount} fichiers convertis avec succès, ${errorCount} erreurs.`);
}

const args = process.argv.slice(2);
if (args.length !== 2) {
    console.error('Usage: node script.js repertoire_entree repertoire_sortie');
    process.exit(1);
}

const [inputDir, outputDir] = args;

console.log(`Traitement des fichiers .txt de ${inputDir} vers des fichiers .tex dans ${outputDir}`);
processFiles(inputDir, outputDir);
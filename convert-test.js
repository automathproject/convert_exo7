#!/usr/bin/env node
/**
 * Transformation d'exercices LaTeX depuis l'ancien format (contenu dans des fichiers .txt)
 * vers le nouveau template, générant des fichiers .tex en sortie.
 *
 * Usage :
 *    node transformDir.js chemin/vers/repertoire_input chemin/vers/repertoire_output
 *
 * Le script parcourt tous les fichiers .txt du répertoire d'entrée, effectue la transformation et
 * crée un fichier de sortie correspondant dans le répertoire de sortie en remplaçant l'extension par .tex.
 */

const fs = require('fs');
const path = require('path');

// Vérification des arguments
if (process.argv.length < 4) {
  console.error("Usage: node transformDir.js input_directory output_directory");
  process.exit(1);
}

const inputDir = process.argv[2];
const outputDir = process.argv[3];

// Vérifier que le répertoire d'entrée existe
if (!fs.existsSync(inputDir)) {
  console.error(`Le répertoire d'entrée "${inputDir}" n'existe pas.`);
  process.exit(1);
}

// Créer le répertoire de sortie s'il n'existe pas
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Fonction de transformation d'un contenu LaTeX depuis l'ancien format vers le nouveau template.
function transformContent(data) {
  // ---------------------------
  // 1. Extraction de l'en-tête
  // ---------------------------
  const headerRegex = /\\exercice\{([^,]+),\s*([^,]+),\s*([^}]+)\}/;
  const headerMatch = data.match(headerRegex);
  if (!headerMatch) {
    console.error("La commande \\exercice{...} est introuvable.");
    return null;
  }
  const id = headerMatch[1].trim();
  const auteur = headerMatch[2].trim();
  const date = headerMatch[3].trim().replace(/\//g, '-');

  // ----------------------------------
  // 2. Extraction du bloc d'énoncé
  // ----------------------------------
  const enonceRegex = /\\enonce(?:\[[^\]]*\])?\s*([\s\S]*?)\\finenonce/;
  const enonceMatch = data.match(enonceRegex);
  if (!enonceMatch) {
    console.error("Le bloc \\enonce...\\finenonce est introuvable.");
    return null;
  }
  const enonceBlock = enonceMatch[1].trim();

  // Recherche d'un environnement enumerate dans l'énoncé
  let textePart = "";
  let questionsArray = [];
  const enumRegex = /\\begin\{enumerate\}([\s\S]*?)\\end\{enumerate\}/;
  const enumMatch = enonceBlock.match(enumRegex);
  if (enumMatch) {
    // Le texte précédant l'environnement enumerate est placé dans \texte{...}
    const indexEnum = enonceBlock.indexOf(enumMatch[0]);
    textePart = enonceBlock.substring(0, indexEnum).trim();

    // Extraction des items de l'environnement enumerate (chaque \item correspond à une question)
    const enumContent = enumMatch[1];
    const itemRegex = /\\item\s*([\s\S]*?)(?=\\item|$)/g;
    let match;
    while ((match = itemRegex.exec(enumContent)) !== null) {
      const itemText = match[1].trim();
      if (itemText) {
        questionsArray.push(itemText);
      }
    }
  } else {
    // S'il n'y a pas d'environnement enumerate, tout le bloc est considéré comme texte
    textePart = enonceBlock;
  }

  // ----------------------------------
  // 3. Extraction du bloc correction
  // ----------------------------------
  const correctionRegex = /\\correction\s*([\s\S]*?)\\fincorrection/;
  const correctionMatch = data.match(correctionRegex);
  let correctionBlock = correctionMatch ? correctionMatch[1].trim() : "";
  let correctionsArray = [];
  let correctionWhole = "";

  if (correctionBlock) {
    // Vérification de la présence d'un environnement enumerate dans le bloc correction
    const corrEnumMatch = correctionBlock.match(/\\begin\{enumerate\}([\s\S]*?)\\end\{enumerate\}/);
    if (corrEnumMatch) {
      // Extraction des items de la correction
      const corrEnumContent = corrEnumMatch[1];
      const itemRegex = /\\item\s*([\s\S]*?)(?=\\item|$)/g;
      let match;
      while ((match = itemRegex.exec(corrEnumContent)) !== null) {
        const itemText = match[1].trim();
        if (itemText) {
          correctionsArray.push(itemText);
        }
      }
    } else {
      // Pas d'environnement enumerate : on prend le bloc correction entier
      correctionWhole = correctionBlock;
    }
  }

  // ----------------------------------
  // 4. Extraction du bloc indication (facultatif)
  // ----------------------------------
  const indicationRegex = /\\indication\s*([\s\S]*?)\\finindication/;
  const indicationMatch = data.match(indicationRegex);
  const indicationContent = indicationMatch ? indicationMatch[1].trim() : "";

  // ----------------------------------
  // 5. Construction du nouveau contenu
  // ----------------------------------
  let output = "";

  // En-tête
  output += `\\uuid{${id}}\n`;
  output += `\\auteur{${auteur}}\n`;
  output += `\\datecreate{${date}}\n\n`;

  // Début du bloc contenu
  output += `\\contenu{\n`;

  // Insertion du texte de l'énoncé
  output += `\\texte{\n${textePart}\n}\n`;

  // Traitement de l'environnement enumerate (questions)
  if (questionsArray.length > 0) {
    output += `\\begin{enumerate}\n`;
    // Vérifier si on peut associer chaque question à une correction
    const associerCorrections = (correctionsArray.length === questionsArray.length);
    for (let i = 0; i < questionsArray.length; i++) {
      output += `    \\item \\question{${questionsArray[i]}}\n`;
      if (associerCorrections) {
        output += `\\reponse{${correctionsArray[i]}}\n`;
      }
    }
    // Si le nombre d'items de correction ne correspond pas, on regroupe tout le bloc correction
    if (!associerCorrections) {
      if (!correctionWhole && correctionsArray.length > 0) {
        correctionWhole = correctionsArray.join("\n");
      }
      if (correctionWhole) {
        output += `\\reponse{\n${correctionWhole}\n}\n`;
      }
    }
    // Insertion du bloc indication (s'il existe)
    if (indicationContent) {
      output += `\\indication{${indicationContent}}\n`;
    }
    output += `\\end{enumerate}\n`;
  } else {
    // S'il n'y a pas d'environnement enumerate dans l'énoncé,
    // on insère éventuellement le bloc indication puis le bloc correction global
    if (indicationContent) {
      output += `\\indication{${indicationContent}}\n`;
    }
    if (correctionWhole || correctionsArray.length > 0) {
      if (!correctionWhole && correctionsArray.length > 0) {
        correctionWhole = correctionsArray.join("\n");
      }
      output += `\\reponse{\n${correctionWhole}\n}\n`;
    }
  }

  output += `}\n`;

  return output;
}

// Parcours des fichiers dans le répertoire d'entrée
fs.readdir(inputDir, (err, files) => {
  if (err) {
    console.error("Erreur lors de la lecture du répertoire d'entrée :", err);
    process.exit(1);
  }

  // Filtrer uniquement les fichiers se terminant par .txt
  const txtFiles = files.filter(file => file.endsWith('.txt'));

  if (txtFiles.length === 0) {
    console.log("Aucun fichier .txt trouvé dans le répertoire d'entrée.");
    process.exit(0);
  }

  // Pour chaque fichier .txt, effectuer la transformation
  txtFiles.forEach(file => {
    const inputFilePath = path.join(inputDir, file);
    // On remplace l'extension .txt par .tex pour le fichier de sortie
    const outputFileName = file.replace(/\.txt$/, '.tex');
    const outputFilePath = path.join(outputDir, outputFileName);

    fs.readFile(inputFilePath, 'utf8', (err, data) => {
      if (err) {
        console.error(`Erreur lors de la lecture du fichier ${inputFilePath} :`, err);
        return;
      }

      const transformed = transformContent(data);
      if (transformed === null) {
        console.error(`La transformation a échoué pour le fichier ${file}.`);
        return;
      }

      fs.writeFile(outputFilePath, transformed, 'utf8', (err) => {
        if (err) {
          console.error(`Erreur lors de l'écriture du fichier ${outputFilePath} :`, err);
        } else {
          console.log(`Transformation réussie pour ${file} -> ${outputFileName}`);
        }
      });
    });
  });
});

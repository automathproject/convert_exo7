#!/usr/bin/env node
/**
 * Transformation d'un exercice LaTeX depuis l'ancien format vers le nouveau template.
 *
 * Règles de transformation :
 * - L'en-tête (\exercice{ID, auteur, date}) est converti en :
 *      \uuid{ID}
 *      \auteur{auteur}
 *      \datecreate{date}   (avec la date au format AAAA-MM-JJ)
 *
 * - Le bloc d'énoncé (entre \enonce et \finenonce) est analysé :
 *      - Tout ce qui se trouve avant un éventuel environnement enumerate
 *        est placé dans \texte{…}.
 *      - Si un environnement enumerate est présent, chacun de ses items
 *        (délimités par \item) est considéré comme une question.
 *
 * - Le bloc correction (entre \correction et \fincorrection) est traité de la façon suivante :
 *      - S'il contient un environnement enumerate avec autant d'items que l'énoncé,
 *        alors chaque item sera associé à la question correspondante via \reponse{…}.
 *      - Sinon, le contenu entier (ou la concaténation de tous les items) sera placé
 *        dans une unique commande \reponse{…}.
 *
 * - Le bloc indication (entre \indication et \finindication), s'il existe, est ajouté.
 *
 * Usage :
 *    node transform.js input.tex output.tex
 */

const fs = require('fs');

// Vérification des arguments
if (process.argv.length < 4) {
  console.error("Usage: node transform.js input.tex output.tex");
  process.exit(1);
}

const inputFile = process.argv[2];
const outputFile = process.argv[3];

fs.readFile(inputFile, 'utf8', (err, data) => {
  if (err) {
    console.error("Erreur lors de la lecture du fichier :", err);
    process.exit(1);
  }

  // ---------------------------
  // 1. Extraction de l'en-tête
  // ---------------------------
  const headerRegex = /\\exercice\{([^,]+),\s*([^,]+),\s*([^}]+)\}/;
  const headerMatch = data.match(headerRegex);
  if (!headerMatch) {
    console.error("La commande \\exercice{...} est introuvable.");
    process.exit(1);
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
    process.exit(1);
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

    // Extraction des items de l'environment enumerate (chaque \item correspond à une question)
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
    // S'il n'y a pas d'environment enumerate, tout le bloc est considéré comme texte
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
      // Pas d'environment enumerate : on prend le bloc correction entier
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

  // ----------------------------------
  // 6. Écriture du fichier de sortie
  // ----------------------------------
  fs.writeFile(outputFile, output, 'utf8', (err) => {
    if (err) {
      console.error("Erreur lors de l'écriture du fichier :", err);
      process.exit(1);
    }
    console.log(`Transformation réussie : ${outputFile}`);
  });
});

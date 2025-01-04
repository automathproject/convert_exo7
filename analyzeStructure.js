/**
 * analyzeStructure.js
 */

const fs = require('fs');
const path = require('path');
const { Parser } = require('sql-ddl-to-json-schema');

/**
 * Supprime la plupart des types de commentaires MySQL :
 *  - Lignes commençant par --
 *  - Lignes commençant par #
 *  - Blocs /* ... * / (multilignes)
 */
function removeComments(sql) {
  return sql
    // Supprimer commentaires ligne commençant par --
    .replace(/^--.*$/gm, '')
    // Supprimer commentaires ligne commençant par #
    .replace(/^#.*$/gm, '')
    // Supprimer commentaires /* ... */
    .replace(/\/\*[\s\S]*?\*\//g, '');
}

async function analyzeSqlStructure(filePath, dialect = 'mysql') {
  try {
    // 1) Lecture du contenu du fichier
    const rawContent = fs.readFileSync(filePath, 'utf8');

    // 2) Nettoyage des commentaires (oublier --, #, /*...*/)
    const content = removeComments(rawContent);

    // 3) Initialiser le parseur
    const parser = new Parser(dialect);

    // 4) Alimenter le parseur avec le SQL "nettoyé"
    const ast = parser.feed(content).toJsonSchemaArray();

    // 5) Affichage du résultat
    console.log(JSON.stringify(ast, null, 2));
  } catch (error) {
    console.error('Erreur lors de l\'analyse du fichier SQL :', error);
  }
}

const filePath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(__dirname, 'example.sql');

analyzeSqlStructure(filePath, 'mysql');

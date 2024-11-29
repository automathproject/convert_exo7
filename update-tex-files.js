const fs = require('fs').promises;
const path = require('path');

/**
 * Updates a single .tex file based on JSON entry information
 * @param {Object} jsonEntry - Entry containing exo7id, themes, and uuid
 * @param {string} texDir - Directory containing .tex files
 */
async function updateTexFile(jsonEntry, texDir) {
    // Construct filename from exo7id with padding zeros
    const filename = `ex${String(jsonEntry.exo7id).padStart(6, '0')}.tex`;
    const filepath = path.join(texDir, filename);

    try {
        // Read the original content
        const content = await fs.readFile(filepath, 'utf8');

        // Create themes string with comma separation
        const themesStr = jsonEntry.themes.join(', ');

        // Prepare the new content
        let newContent = content;

        // Update or add themes
        if (content.includes('\\theme{')) {
            // Replace existing theme
            newContent = newContent.replace(/\\theme{[^}]*}/, `\\theme{${themesStr}}`);
        } else {
            // Add theme at the beginning
            newContent = `\\theme{${themesStr}}\n${newContent}`;
        }

        // Add UUID if it doesn't exist
        if (!newContent.includes('\\uuid{')) {
            newContent = `\\uuid{${jsonEntry.uuid}}\n${newContent}`;
        }

        // Write the modified content back to the file
        await fs.writeFile(filepath, newContent, 'utf8');
        console.log(`Successfully updated ${filename}`);

    } catch (error) {
        if (error.code === 'ENOENT') {
            console.warn(`Warning: File ${filename} does not exist`);
        } else {
            console.error(`Error processing ${filename}: ${error.message}`);
        }
    }
}

/**
 * Process the entire JSON file and update corresponding .tex files
 * @param {string} jsonFilePath - Path to the JSON file
 * @param {string} texDir - Directory containing .tex files
 */
async function processJsonFile(jsonFilePath, texDir) {
    try {
        // Read and parse the JSON file
        const jsonContent = await fs.readFile(jsonFilePath, 'utf8');
        const data = JSON.parse(jsonContent);

        // Process each entry
        const promises = data.map(entry => updateTexFile(entry, texDir));
        await Promise.all(promises);

        console.log('All files have been processed');
    } catch (error) {
        console.error('Error processing JSON file:', error.message);
    }
}

// Example usage:
// processJsonFile('path/to/info_themes.json', 'path/to/oym/')

// If you want to run this directly from command line:
if (require.main === module) {
    const jsonFilePath = process.argv[2];
    const texDir = process.argv[3];
    
    if (!jsonFilePath || !texDir) {
        console.error('Usage: node script.js <path-to-json> <path-to-tex-dir>');
        process.exit(1);
    }

    processJsonFile(jsonFilePath, texDir);
}

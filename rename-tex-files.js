const fs = require('fs').promises;
const path = require('path');

/**
 * Extracts UUID from tex file content if present
 * @param {string} content - Content of the tex file
 * @returns {string|null} UUID if found, null otherwise
 */
function extractUuid(content) {
    const match = content.match(/\\uuid\{([^}]+)\}/);
    return match ? match[1] : null;
}

/**
 * Processes a single .tex file
 * @param {string} filePath - Path to the tex file
 * @param {string} dirPath - Directory containing the tex file
 */
async function processTexFile(filePath, dirPath) {
    try {
        // Read file content
        const content = await fs.readFile(filePath, 'utf8');
        
        // Extract UUID
        const uuid = extractUuid(content);
        
        if (uuid) {
            const newFileName = `${uuid}.tex`;
            const newFilePath = path.join(dirPath, newFileName);
            
            // Check if target file already exists
            try {
                await fs.access(newFilePath);
                console.warn(`Warning: Cannot rename ${path.basename(filePath)} to ${newFileName} - target file already exists`);
                return;
            } catch {
                // File doesn't exist, we can proceed with rename
                await fs.rename(filePath, newFilePath);
                console.log(`Renamed ${path.basename(filePath)} to ${newFileName}`);
            }
        } else {
            console.log(`No UUID found in ${path.basename(filePath)}`);
        }
    } catch (error) {
        console.error(`Error processing ${path.basename(filePath)}: ${error.message}`);
    }
}

/**
 * Process all .tex files in the specified directory
 * @param {string} dirPath - Path to the directory containing tex files
 */
async function processDirectory(dirPath) {
    try {
        // Get all files in directory
        const files = await fs.readdir(dirPath);
        
        // Filter for .tex files and process each one
        const texFiles = files.filter(file => file.endsWith('.tex'));
        console.log(`Found ${texFiles.length} .tex files`);
        
        const promises = texFiles.map(file => 
            processTexFile(path.join(dirPath, file), dirPath)
        );
        
        await Promise.all(promises);
        console.log('Finished processing all files');
        
    } catch (error) {
        console.error('Error processing directory:', error.message);
    }
}

// If running from command line
if (require.main === module) {
    const dirPath = process.argv[2];
    
    if (!dirPath) {
        console.error('Usage: node script.js <path-to-tex-directory>');
        process.exit(1);
    }

    processDirectory(dirPath);
}

module.exports = { processDirectory };

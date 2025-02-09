const fs = require('fs');
const path = require('path');

// Read the JSON file
const exercisesData = JSON.parse(fs.readFileSync('structure/exercices.json', 'utf8'));

// Get all files in the oymv2 directory
const directoryPath = 'oymv2';
const files = fs.readdirSync(directoryPath);

// Create a mapping of exo7id to uuid
const idToUuidMap = {};
exercisesData.forEach(exercise => {
    if (exercise.exo7id && exercise.uuid) {
        idToUuidMap[exercise.exo7id] = exercise.uuid;
    }
});

// Rename files
files.forEach(file => {
    const oldName = path.parse(file).name; // Get filename without extension
    const extension = path.parse(file).ext;
    
    if (idToUuidMap[oldName]) {
        const oldPath = path.join(directoryPath, file);
        const newPath = path.join(directoryPath, idToUuidMap[oldName] + extension);
        
        try {
            fs.renameSync(oldPath, newPath);
            //console.log(`Renamed: ${file} -> ${idToUuidMap[oldName]}${extension}`);
        } catch (err) {
            console.error(`Error renaming ${file}:`, err);
        }
    }
});

console.log('Renaming complete!');
const fs = require('fs');

// Function to generate a random 4-character alphanumeric UUID
function generateShortUUID() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Read and process the JSON file
try {
    // Read the file
    const data = fs.readFileSync('exercices.json', 'utf8');
    const exercises = JSON.parse(data);

    // Add UUID to each exercise
    exercises.forEach(exercise => {
        if (!exercise.uuid) {
            exercise.uuid = generateShortUUID();
        }
    });

    // Write back to file
    fs.writeFileSync('exercices.json', JSON.stringify(exercises, null, 2));
    console.log('UUIDs have been generated and added successfully');
} catch (err) {
    console.error('Error:', err);
}
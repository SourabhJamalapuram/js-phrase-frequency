const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Define the path to your script
const scriptPath = path.join(__dirname, './main.js'); // Replace with your actual script path

// Define the path to your test file
const testFilePath = path.join(__dirname, 'testFiles', './text-file.txt'); // Adjust path as per your file structure

// Define the expected top N items to validate
const expectedTopItems = [
    [ 'this is crazy', 4 ],
    [ "shouldn't this text", 3 ],
    [ 'what is the', 2 ],
    // Add more expected top items as needed
];

// Run the integration test
test('File Processing and Output Validation', (done) => {
    // Execute the script with the test file
    const child = spawn('node', [scriptPath, testFilePath]);

    let consoleOutput = ''; // Variable to capture console output

    // Capture stdout from the script
    child.stdout.on('data', (data) => {
        consoleOutput += data.toString();
    });

    // Capture stderr for any errors
    let stderr = '';
    child.stderr.on('data', (data) => {
        stderr += data.toString();
    });

    // Handle script completion
    child.on('close', (code) => {
        // Split console output into lines and parse top N items
        const lines = consoleOutput.trim().split('\n');
        const actualTopItems = lines.slice(0, 3).map(line => {
            const [phrase, count] = JSON.parse(line);
            return [phrase, count];
        });

        // Assert actualTopItems match expectedTopItems
        expect(actualTopItems).toEqual(expectedTopItems);

        // Assert no errors in stderr
        expect(stderr).toBe('');

        done();
    });
});

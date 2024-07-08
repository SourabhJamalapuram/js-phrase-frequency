const fs = require('fs');
const readline = require('readline');

const TOP_N_PHRASES = 5;

//List of filename(s) provided by user through command line arguments
const filenames = process.argv.slice(2);

/**
 * Processes input on stdin
 * Reads input line by line, passing it to groups phrases, and returns the resulting phrase frequency map.
 * @returns {Promise<Object>} - A promise resolving to an object containing phrase frequencies.
 */
async function processStdin() {
    // Create readline interface to read from standard input
    const rl = readline.createInterface({
        input: process.stdin
    });

    try{
        // Call groupPhrases function asynchronously with the readline interface
        return await groupPhrases(rl)
    } finally {
        // Close the readline interface after processing
        rl.close()
    }

}

/**
 * Groups phrases of three consecutive words from a string and counts their occurrences
 * @param {readline.Interface} rl  - The readline interface for reading input lines asynchronously
 * @returns {Object} - An object mapping each unique three-word phrase to its occurences.
 */
async function groupPhrases(rl){
    let wordCount = 0; // Initialize index for current word position
    let words = []; // Array to store up to three words
    let word = ''; // Variable to build current word

    let phraseMap = {};
    
    for await (const line of rl) {
        for (let i = 0; i <= line.length; i++) {
            // Check if current character is not a part of a valid word (Unicode letters, apostrophes, hyphens)
            if (!line[i]?.match(/[\p{L}\p{M}'-]+/u) || i === line.length) { 
                if (word !== '') {
                    words[wordCount] = word.toLowerCase(); // Convert word to lowercase and store in words array
                    wordCount += 1; // Move to the next word position
                    word = ''; // Reset word variable
    
                    // Check if three words have been collected
                    if (wordCount == 3) {
                        let key = `${words[0]} ${words[1]} ${words[2]}` // Create key from the three word sequence

                        // Update frequency count of key(phrase)
                        phraseMap[key] = phraseMap[key] ? phraseMap[key] + 1 : 1;
    
                        // Rotate words array to prepare for the next sequence
                        words[0] = words[1];
                        words[1] = words[2];
                        words[2] = '';
                        wordCount = 2;
                    }
                }
            } else {
                word += line[i]; 
            }
        }
    }

    // Return the map of phrase frequencies
    return phraseMap;
}


/**
 * Merges two phrase frequency maps, combining their counts for common keys and adding any other unique keys.
 * @param {Object} map1 - The first map containing phrase-frequency pairs.
 * @param {Object} map2 - The second map containing phrase-frequency pairs to merge with map1.
 * @returns {Object} - A new map with merged phrase frequencies from map1 and map2.
 */
function mergePhraseFreqMaps(map1, map2) {
    let mergedMap = {}

    // Merge frequencies from map1
    Object.keys(map1).forEach(key => {
        if(map2.hasOwnProperty(key)){
            mergedMap[key] = map1[key] + map2[key] // Combine frequencies if key exists in both maps
        } else{
            mergedMap[key] = map1[key] // Otherwise, use frequency from map1
        }
    });

    // Add frequencies from map2 that are unique
    Object.keys(map2).forEach(key => {
        if(!map1.hasOwnProperty(key)){
            mergedMap[key] = map2[key]  // Add frequency from map2 if key is not in map1
        }
    });

    // Return the merged map
    return mergedMap;
}

/**
 * Processes a file to generate a map of phrase frequencies.
 * Reads the file, groups phrases, merges results, and returns the final map.
 * @param {string} filename - The name of the file to process.
 * @returns {Promise<Object>} - A promise resolving to an object containing phrase frequencies.
 */
async function processFile(filename){
    // Group phrases from content
    const readStream = fs.createReadStream(filename, { encoding: 'utf8' });

    // Create readline interface to read from standard input
    const rl = readline.createInterface({
        input: readStream,
        crlfDelay: Infinity // Read entire lines without truncating
    });

    try{
        // Call groupPhrases function asynchronously with the readline interface
        let phraseMap = await groupPhrases(rl);
        return phraseMap;
    } finally{
        // Close the readline interface after processing
        rl.close()
    }
    
}


/**
 * Prints the top N phrases from a given map, sorted by frequency.
 * @param {Object} map - The map object containing phrases as keys and their counts as values.
 * @param {number} n - The number of top phrases to print.
 */
function printTopPhrases(map, n) {
    // Sort phrases by frequency in descending order
    let topPhrases = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, n);
    // Print the top N phrases and their frequencies
    console.log(topPhrases);
}

/**
 * Main function orchestrating the text analysis process.
 * processes filenames provided via command-line arguments or standard input,
 * merges results from multiple files, and prints the top phrases by frequency.
 */
async function main() {
    let executionTimerLabel = `Time Taken To Process`;
    console.time(executionTimerLabel); // Start the timer to measure execution time
    
    let resultMap = {}; // Initialize empty result map

    if (filenames.length > 0) { // Check if filenames are provided
        // Process each file asynchronously and merge results
        let filePromises = filenames.map(filename => processFile(filename));
        await Promise.allSettled(filePromises)
            .then(results => {
                results.forEach(result => {
                    if (result.status == 'fulfilled') {
                        if(filenames.length == 1){
                            resultMap = result.value
                        }else{
                            resultMap = mergePhraseFreqMaps(resultMap, result.value); // Merge results into resultMap
                        }
                    } else {
                        console.log('Rejected: ', result.reason); // Log any rejected promises
                    }
                });
            });
    } else if (process.stdin.isTTY) {
        // Check if stdin is not provided by terminal
        console.log('No filenames provided and no stdin available.');
        console.timeEnd(executionTimerLabel); // End the timer and log the time without further processing
        return;
    } else {
        resultMap = await processStdin(); // Process stdin if no filenames are provided
    }

    printTopPhrases(resultMap, TOP_N_PHRASES); // Print the top phrases by frequency
    console.timeEnd(executionTimerLabel); // End the timer and log the time
}


if (require.main === module) {
    main();
}

// Exports functions for unit testing: groupPhrases, mergePhraseFreqMaps, processFile
module.exports = { groupPhrases, mergePhraseFreqMaps, processFile };
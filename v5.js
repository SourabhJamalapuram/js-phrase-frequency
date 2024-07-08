const fs = require('fs');
const readline = require('readline');


//List of filename(s) provided by user through command line arguments
const filenames = process.argv.slice(2);

/**
 * Asynchronously processes stdin to generate a map of phrase frequencies.
 * Reads input line by line, groups phrases, and returns the resulting phrase frequency map.
 * @returns {Promise<Object>} - A promise resolving to an object containing phrase frequencies.
 */
async function processStdin() {
    const rl = readline.createInterface({
        input: process.stdin // Read from standard input
    });

    let content = '';

    // Read input line by line
    for await (const line of rl) {
        content += line + '\n';
    }

    rl.close(); // Close readline interface

    // Return the map of grouped phrase frequencies
    return groupPhrases(content);
}

/**
 * Groups phrases of three consecutive words from a string and counts their occurrences
 * @param {string} str - The input text containing the phrases that need to be analyzed
 * @returns {Object} - An object mapping each unique three-word phrase to its occurences.
 */
/**
 * Groups phrases of three consecutive words from a string and counts their occurrences
 * @param {string} str - The input text containing the phrases that need to be analyzed
 * @returns {Object} - An object mapping each unique three-word phrase to its occurences.
 */
async function groupPhrases(filename){
    const readStream = fs.createReadStream(filename, { encoding: 'utf8' });

    const rl = readline.createInterface({
        input: readStream,
        crlfDelay: Infinity // Read entire lines without truncating
    });

    let wordCount = 0; // Initialize index for current word position
    let words = []; // Array to store up to three words
    let word = ''; // Variable to build current word

    let phraseMap = {};
    
    for await (const line of rl) {
        //console.log(line)

        for (let i = 0; i <= line.length; i++) {
            // Check if current character is not a part of a valid word (Unicode letters, apostrophes, hyphens)
            if (!line[i]?.match(/[\p{L}\p{M}'-]+/u) || i === line.length) { // Updated regex pattern
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
 * Merges two phrase frequency maps, combining their counts for common keys and adding unique keys.
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
 * Asynchronously processes a file to generate a map of phrase frequencies.
 * Reads the file, groups phrases, merges results, and returns the final map.
 * @param {string} filename - The name of the file to process.
 * @returns {Promise<Object>} - A promise resolving to an object containing phrase frequencies.
 */
async function processFile(filename){
    let resultMap = {}

    // Read file content asynchronously
   // const content = await fs.readFile(filename, 'utf8');

    // Group phrases from content
    let phraseMap = await groupPhrases(filename);

    // Merge phrase frequency maps
    resultMap = mergePhraseFreqMaps(resultMap, phraseMap)

    return resultMap;
}


/**
 * Prints the top N phrases from a given map, sorted by frequency.
 * @param {Object} map - The map object containing phrases as keys and their counts as values.
 * @param {number} N - The number of top phrases to print.
 */
function printTopPhrases(map, N) {
    // Sort phrases by frequency in descending order
    let topPhrases = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, N);
    // Print the top N phrases and their frequencies
    console.log(topPhrases);
}


async function main() {
    console.time('myFunction'); // Start the timer
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
    } else {
        resultMap = await processStdin(); // Process stdin if no filenames are provided
    }

    printTopPhrases(resultMap, 5); // Print the top phrases by frequency
    console.timeEnd('myFunction'); // End the timer and log the time
}


if (require.main === module) {
    main();
}

module.exports = { groupPhrases, mergePhraseFreqMaps, processFile };
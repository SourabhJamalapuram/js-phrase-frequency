/**
 * Groups phrases of three consecutive words from a string and counts their occurrences
 * @param {string} str - The input text containing the phrases that need to be analyzed
 * @returns {Object} - An object mapping each unique three-word phrase to its occurences.
 */
function groupPhrases(filename){
    const readStream = fs.createReadStream(filename, { encoding: 'utf8' });

    const rl = readline.createInterface({
        input: readStream,
        crlfDelay: Infinity // Read entire lines without truncating
    });

    let wordCount = 0; // Initialize index for current word position
    let words = []; // Array to store up to three words
    let word = ''; // Variable to build current word

    for await (const line of rl) {
        let phraseMap = {};
        
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
    
        // Return the map of phrase frequencies
        return phraseMap;
    }

}



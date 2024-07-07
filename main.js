const fs = require('fs').promises;
const readline = require('readline');

let numOfPhrases = 5;


//List of filename(s) provided by user through command line arguments
const filenames = process.argv.slice(2);


//Function to count the frequency phrases(three word sequences)
function groupPhrases(str){
        let phraseMap = {};

        let wordIndex = 0;
        let words = [];
        let word = ''; 
        
        for (let i = 0; i <= str.length; i++) {
            if (!str[i]?.match(/[\p{L}\p{M}'-]+/u) || i === str.length) { // Updated regex pattern
                if (word !== '') {
                    words[wordIndex] = word.toLowerCase(); 
                    wordIndex += 1;
                    word = '';
                    if (wordIndex === 3) {
                        let key = `${words[0]} ${words[1]} ${words[2]}`

                        phraseMap[key] = phraseMap[key] ? phraseMap[key] + 1 : 1;

                        words[0] = words[1];
                        words[1] = words[2];
                        words[2] = '';
                        wordIndex = 2;
                    }
                }
            } else {
                word += str[i];
            }
        }

        return phraseMap;
}


function printTopPhrases(map) {
    let top5Phrases = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
    console.log(top5Phrases);
}

function mergePhraseFreqMaps(map1, map2) {
    let mergedMap = {}

    Object.keys(map1).forEach(key => {
        if(map2.hasOwnProperty(key)){
            mergedMap[key] = map1[key] + map2[key]
        } else{
            mergedMap[key] = map1[key]
        }
    });

    Object.keys(map2).forEach(key => {
        if(!map1.hasOwnProperty(key)){
            mergedMap[key] = map2[key]
        }
    });

    return mergedMap;
}


async function processFile(filename){
    let resultMap = {}

    const content = await fs.readFile(filename, 'utf8');
    let phraseMap = groupPhrases(content);
    resultMap = mergePhraseFreqMaps(resultMap, phraseMap)

    return resultMap;
}

async function processStdin() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });

    let content = '';
    for await (const line of rl) {
        content += line + '\n';
    }

    rl.close();

    let phraseMap = groupPhrases(content);
    return phraseMap;
}

async function main() {
    let resultMap = {};

    if (filenames.length > 0) {
        let filePromises = filenames.map(filename => processFile(filename));
        await Promise.allSettled(filePromises)
            .then(results => {
                results.forEach(result => {
                    if (result.status == 'fulfilled') {
                        resultMap = mergePhraseFreqMaps(resultMap, result.value);
                    } else {
                        console.log('Rejected: ', result.reason);
                    }
                });
            });
    } else {
        resultMap = await processStdin();
    }

    printTopPhrases(resultMap);
}


if (require.main === module) {
    main();
}

module.exports = { groupPhrases, mergePhraseFreqMaps, processFile };
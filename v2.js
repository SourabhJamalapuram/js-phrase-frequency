const fs = require('fs').promises;


let numOfPhrases = 5;

let freqMap = {}

//Validation Check: Verify the user has inputted a file for processing
if (process.argv.length < 3) {
    console.log('Please Provide A Filename\nEx) node main.js <filename>');
    process.exit(1);

}

//List of filename(s) provided by user through command line arguments
const filenames = process.argv.slice(2);

//Function to modify text
function cleanText(text){
        return text.replace(/[^\w\s']/g, "") //get rid of punctuation
            .replace(/\s+/g, " ") //get rid of line endings
            .toLowerCase() //ensures case insensitive
            .split(/\s+/) //splits the text into words
            .filter(word => word.length > 0); //ensures there are no empty '' words
}

//Function to count the frequency phrases(three word sequences)
function groupPhrases(text){
    let words = cleanText(text);
    //let phraseFreqMap = {}

    for(let i=0;i<words.length - 2;++i){
        let key = `${words[i]} ${words[i+1]} ${words[i+2]}`
        freqMap[key] = freqMap[key] ? freqMap[key] + 1 : 1;
    }

    //return phraseFreqMap;
}


//Function to read and return the content from a singular file
async function getFileContents(filename){
    try {
        const data = await fs.readFile(filename, 'utf8');
        return data;
    } catch (err) {
        console.error(`Error reading file: ${err.message}`);
        return null;
    }
}

/*
//Function to aggregate frequency maps
function mergePhraseFreqMaps(aggregatedMap, phraseFreqMap) {
    Object.keys(phraseFreqMap).forEach(key => {
        if (aggregatedMap[key]) {
            aggregatedMap[key] += phraseFreqMap[key];
        } else {
            aggregatedMap[key] = phraseFreqMap[key];
        }
    });
}
*/


async function main(){
    //let aggregatedPhraseFreqMap = {};

    for(const filename of filenames){
        const content = await getFileContents(filename)
        if (content) {
            groupPhrases(content);
        }else {
            console.log(`Skipping ${filename} due to error reading file.`);
        }
    }

    let top5Phrases = Object.entries(freqMap).sort((a,b) => b[1] - a[1]).slice(0,5)
    console.log(top5Phrases)

    /*
    for (const filename of filenames) {
        const content = await getFileContents(filename);
        if (content) {
            let phraseFreqMap = groupPhrases(content);
            mergePhraseFreqMaps(aggregatedPhraseFreqMap, phraseFreqMap);
        } else {
            console.log(`Skipping ${filename} due to error reading file.`);
        }
    }

    let aggregatedPhraseArray = Object.entries(aggregatedPhraseFreqMap);
    aggregatedPhraseArray.sort((a, b) => b[1] - a[1]);

    let top5Phrases = aggregatedPhraseArray.slice(0, numOfPhrases);

    console.log("Top 5 phrases across all files:");
    console.log(top5Phrases);
    */

}

main()
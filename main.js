const fs = require('fs').promises;

let numOfPhrases = 5;

if (process.argv.length < 3) {
    console.log('Please Provide A Filename\nEx) node main.js <filename>');
    process.exit(1);

}

const filenames = process.argv.slice(2);

function cleanText(text){
        return text.replace(/[^\w\s']/g, "")
            .replace(/\s+/g, " ")
            .toLowerCase(); 
}

function groupPhrases(text){
    let cleanedText = cleanText(text);
    let words = cleanedText.split(/\s+/).filter(word => word.length > 0);
    let phraseFreqMap = {}

    for(let i=0;i<words.length - 2;++i){
        let key = `${words[i]} ${words[i+1]} ${words[i+2]}`
        phraseFreqMap[key] = phraseFreqMap[key] ? phraseFreqMap[key] + 1 : 1;
    }

    return phraseFreqMap;
}


async function getFileContents(filename){
    try {
        const data = await fs.readFile(filename, 'utf8');
        return data;
    } catch (err) {
        console.error(`Error reading file: ${err.message}`);
        return null;
    }
}

function mergePhraseFreqMaps(aggregatedMap, phraseFreqMap) {
    Object.keys(phraseFreqMap).forEach(key => {
        if (aggregatedMap[key]) {
            aggregatedMap[key] += phraseFreqMap[key];
        } else {
            aggregatedMap[key] = phraseFreqMap[key];
        }
    });
}


async function main(){
    let aggregatedPhraseFreqMap = {};

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

}

main()
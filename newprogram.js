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


//Function to count the frequency phrases(three word sequences)
function groupPhrases(str){
        let wordIndex = 0;
        let words = [];
        let word = ''; 
        
        for (let i = 0; i <= str.length; i++) {
            if (!str[i]?.match(/\w/) || i === str.length) { 
                if (word !== '') {
                    words[wordIndex] = word.toLowerCase(); 
                    wordIndex += 1;
                    word = '';
                    if (wordIndex === 3) {
                        let key = `${words[0]} ${words[1]} ${words[2]}`

                        freqMap[key] = freqMap[key] ? freqMap[key] + 1 : 1;

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




async function main(){

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

}

main()
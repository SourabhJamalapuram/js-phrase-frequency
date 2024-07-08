const fs = require('fs');
const path = require('path');
const assert = require('assert');
const readline = require('readline');

const mainModule = require('./main');

/**
 * Function to display successful unit test messages in green
 */
function colorizeGreen(message) {
    return `\x1b[32m${message}\x1b[0m`;  
}

/**
 * Function to display failed unit test messages in red
 */
function colorizeRed(message) {
    return `\x1b[31m${message}\x1b[0m`; 
}

// Helper function to create a temporary file and temporary read stream given some text
function createStream(content) {
    const tempFilePath = path.join(__dirname, 'unit-test.txt');
    fs.writeFileSync(tempFilePath, content, 'utf8');


    const readStream = fs.createReadStream(tempFilePath, { encoding: 'utf8' });

    const rl = readline.createInterface({
        input: readStream,
        crlfDelay: Infinity
    });

    return rl;
}

/**
 * Unit test to verify that groupPhrases correctly ignores punctuation.
 */
async function testIgnoresPunctuation() {
    const { groupPhrases } = mainModule;

    let content = 'This sentence, with its commas and periods. Is it ignoring correctly? This should be analyzed correctly!';
    let rl = createStream(content)

    try {
        let freqMap = await groupPhrases(rl);
    
        assert.strictEqual(freqMap['sentence with its'], 1, 'Sequence should ignore comma');
        assert.strictEqual(freqMap['and periods is'], 1, 'Sequence should ignore period');
        assert.strictEqual(freqMap['ignoring correctly this'], 1, 'Sequence should ignore question mark');
        assert.strictEqual(freqMap['be analyzed correctly'], 1, 'Sequence should ignore exclamation point');

        console.log(colorizeGreen('\u2714 Passed: Ignores Punctuation'));
    } catch (err) {
        console.error(colorizeRed(`\u2714 Failed - Ignores Punctuation: ${err.message}`));
    } finally{
        rl.close()
    }
}

/**
 * Unit test to verify that groupPhrases correctly ignores line endings.
 */
async function testLineEndings() {
    const { groupPhrases } = mainModule;

    let content = 'This sentence, with its\n line endings';
    let rl = createStream(content)
    try {
        let freqMap = await groupPhrases(rl);
    
        assert.strictEqual(freqMap['its line endings'], 1, 'Sequence should ignore line ending');
        console.log(colorizeGreen('\u2714 Passed: Ignores Line Endings'));
    } catch (err) {

        console.error(colorizeRed(`\u2714 Failed - Ignores Line Endings: ${err.message}`));
    } finally{
        rl.close()
    }
}

/**
 * Unit test to verify that groupPhrases correctly ensures case is ignored
 */
async function testIsCaseInsensitive() {
    const { groupPhrases } = mainModule;

    let content = 'THIS is upper. this is upper. This is upper'
    let rl = createStream(content)
    try {
        let freqMap = await groupPhrases(rl);
    
        assert.strictEqual(freqMap['this is upper'], 3, 'Sequence should be case insensitive');
        console.log(colorizeGreen('\u2714 Passed: Is Case Insensitive'));
    } catch (err) {
        console.error(colorizeRed(`\u2714 Failed - Is Case Insensitive: ${err.message}`));
    } finally{
        rl.close()
    }
}

/**
 * Unit test to verify that contractions are handled properly
 */
async function testHandlesContractions() {
    const { groupPhrases } = mainModule;

    let content = "this shouldn't fail";
    let rl = createStream(content)
    try {
        let freqMap = await groupPhrases(rl);

        assert.strictEqual(freqMap["this shouldn't fail"], 1, 'Should not seperate contraction');
        console.log(colorizeGreen('\u2714 Passed: Handles Contractions'));
    } catch (err) {
        console.error(colorizeRed(`\u2714 Failed - Handles Contractions: ${err.message}`));
    } finally{
        rl.close()
    }
}

/**
 * Unit test to verify that two maps are being merged correctly
 */
function testMergeMaps() {
    const { mergePhraseFreqMaps } = mainModule;
    try {
        let map1 = {'a': 5, 'b' : 10};
        let map2 = {'a': 10, 'b' : 40, 'c': 100};

        let actualMergedMap = mergePhraseFreqMaps(map1, map2);
        let expected = {'a': 15, 'b' : 50, c:100}
        assert.deepEqual(actualMergedMap, expected, 'Maps should merge(add) coexisting keys and add any remaining ones');
        console.log(colorizeGreen('\u2714 Passed: Merge Maps'));
    } catch (err) {
        console.error(colorizeRed(`\u2714 Failed - Merge Maps: ${err.message}`));
    }
}

/**
 * Unit test to verify the case of an invalid file being provided
 */
function testProcessInvalidFile(){
    const { processFile } = mainModule;
    try {
        assert.rejects(async () => {
            await processFile('/invalid.txt');
        }, (err) => {
            return err.message.includes(`ENOENT: no such file or directory, open '/invalid.txt'`);
        }, 'Promise should reject with expected error message for invalid file');

        console.log(colorizeGreen('\u2714 Passed: Test Invalid File'));

    } catch (err) {
        console.error(colorizeRed(`\u2714 Failed - Test Invalid File: ${err.message}`));
    }
}

/**
 * Main function orchestrating the execution of all test functions
 */
async function main(){
    await testIgnoresPunctuation();
    await testLineEndings();
    await testIsCaseInsensitive();
    await testHandlesContractions();
    
    testMergeMaps();
    testProcessInvalidFile();

    fs.unlinkSync(path.join(__dirname, 'unit-test.txt'));
}

main()


const assert = require('assert');
const mainModule = require('./main');

//Group Phrases
function testIgnoresPunctuation() {
    const { groupPhrases } = mainModule;

    try {
        let freqMap = groupPhrases('This sentence, with its commas and periods. Is it ignoring correctly? This should be analyzed correctly!');
    
        assert.strictEqual(freqMap['sentence with its'], 1, 'Sequence should ignore comma');
        assert.strictEqual(freqMap['and periods is'], 1, 'Sequence should ignore period');
        assert.strictEqual(freqMap['ignoring correctly this'], 1, 'Sequence should ignore question mark');
        assert.strictEqual(freqMap['be analyzed correctly'], 1, 'Sequence should ignore exclamation point');

        console.log('\u2714 Passed: Ignores Punctuation');
    } catch (err) {
        console.error(`Error in testIgnoresPunctuation: ${err.message}`);
        console.error(err.stack); 
    }
}

function testLineEndings() {
    const { groupPhrases } = mainModule;

    try {
        let freqMap = groupPhrases('Test\n this phrase');
    
        assert.strictEqual(freqMap['test this phrase'], 1, 'Sequence should ignore line ending');
        console.log('\u2714 Passed: Ignores Line Endings');
    } catch (err) {
        console.error('\u2718 Failed: ', err.message);
    }
}

function testIsCaseInsensitive() {
    const { groupPhrases } = mainModule;

    try {
        let freqMap = groupPhrases('This sentence, with its commas and periods. Is it ignoring correctly? This should be analyzed correctly!');
    
        assert.strictEqual(freqMap['this sentence with'], 1, 'Sequence should be case insensitive');
        console.log('\u2714 Passed: Is Case Insensitive');
    } catch (err) {
        console.error('\u2718 Failed: ', err.message);
    }
}

function testHandlesContractions() {
    const { groupPhrases } = mainModule;
    try {
        let freqMap = groupPhrases("this shouldn't fail");
        assert.strictEqual(freqMap["this shouldn't fail"], 1, 'Seperating contraction');
        console.log('\u2714 Passed: Handles Contractions');
    } catch (err) {
        console.error('\u2718 Failed: ', err.message);
    }
}


function testMergeMaps() {
    const { mergePhraseFreqMaps } = mainModule;
    try {
        let map1 = {'a': 5, 'b' : 10};
        let map2 = {'a': 10, 'b' : 40, 'c': 100};

        let actualMergedMap = mergePhraseFreqMaps(map1, map2);
        let expected = {'a': 15, 'b' : 50, c:100}
        assert.deepEqual(actualMergedMap, expected, 'Maps should be deeply equal');
        console.log('\u2714 Passed: Merge Maps');

    } catch (err) {
        console.error('\u2718 Failed: ', err.message);
    }
}

function testProcessInvalidFile(){
    const { processFile } = mainModule;
    try {
        assert.rejects(async () => {
            await processFile('/invalid.txt');
        }, (err) => {
            return err.message.includes(`ENOENT: no such file or directory, open '/invalid.txt'`);
        }, 'Promise should reject with expected error message for invalid file');

        console.log('\u2714 Passed: Test Invalid File');

    } catch (err) {
        console.error('\u2718 Failed: ', err.message);
    }
}



testHandlesContractions();
testLineEndings()
testIgnoresPunctuation();
testIsCaseInsensitive();

testMergeMaps();

testProcessInvalidFile()



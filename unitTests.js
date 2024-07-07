const assert = require('assert');
const mainModule = require('./main');

function testIgnoresPunctuation() {
    const { groupPhrases } = mainModule;

    try {
        let freqMap = groupPhrases('This sentence, with its commas and periods. Is it ignoring correctly? This should be analyzed correctly!');
    
        assert.strictEqual(freqMap['sentence with its'], 1, 'Failed: Sequence should ignore comma');
        assert.strictEqual(freqMap['and periods is'], 1, 'Failed: Sequence should ignore period');
        assert.strictEqual(freqMap['ignoring correctly this'], 1, 'Failed: Sequence should ignore question mark');
        assert.strictEqual(freqMap['be analyzed correctly'], 1, 'Failed: Sequence should ignore exclamation point');

        console.log('\u2714 Passed: Ignores Punctuation');
    } catch (err) {
        console.error(`Error in testIgnoresPunctuation: ${err.message}`);
        console.error(err.stack); 
    }
}

testIgnoresPunctuation();
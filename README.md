## How To Run The Program
### Without Docker
1. Install Node.js (https://nodejs.org/en/download/package-manager)
2. `git clone <repo name>`
3. Navigate to project directory via terminal
4. Run the program
   - `cat <filename> | node main.js`
   - `node main.js <filename1> <filename2> ...`

#### Note
Two text files are included in the repository if you would like to use them for testing.
1. test-file1.txt
2. test-file2.txt




### With Docker
1. `docker pull sourabhjam/sequence-analyzer`
2. Run with provided txt file
  - `docker run sourabhjam/sequence-analyzer test-file1.txt`
2. Run with your own file in current directory
  - Mac: `docker run -v "$(pwd)/files":/inputs sourabhjam/sequence-analyzer inputs/<filename>`
  - Windows: `docker run -v c:/temp:/inputs sourabhjam/sequence-analyzer inputs/<filename>`

## Testing
### Running Unit Tests
`node unit-tests.js`

<img width="435" alt="Screen Shot 2024-07-08 at 3 44 56 PM" src="https://github.com/SourabhJamalapuram/js-phrase-frequency/assets/11035797/32ff65a5-ae3c-4f65-88f9-5d2333e6f7d2">



## Sample Run

1. Command Line Arguments

<img width="544" alt="Screen Shot 2024-07-08 at 4 30 40 PM" src="https://github.com/SourabhJamalapuram/js-phrase-frequency/assets/11035797/0182dca3-284d-45d1-a2e7-461a5245ccaf">

3. Stdin

<img width="563" alt="Screen Shot 2024-07-08 at 4 32 20 PM" src="https://github.com/SourabhJamalapuram/js-phrase-frequency/assets/11035797/d5a0ed28-0293-459b-8ec2-ccf3f7ab88a9">



## Program Overview
1. Program accepts one or more files / accepts input on stdin
2. Asynchronously reads through a file line by line
3. Identifies three word sequences and generates a key-value map with the phrase as the key and number of occurences as the value.
4. Merges the results of multiple files
5. Sorts the final result to find the 100 most common three word sequences.

## Optimization Enhancements
1. Parallel Processing
- Promise.all is utilized to enable asynchronous and parallel processing of multiple files.  
3. Word Detection
- Character pointer implementation was used in groupPhrases() instead of using JavaScript functions like split and replace. This approach minimizes overhead and memory consumption by avoiding multiple traversals of large datasets.

## What I Would Do Given More Time
1. Couple Extensibility improvements. There are some extensibility features currently in place such as easily changing the top N number of phrases we want to see. Given more time I would refactor the code to work for other length of sequences and not just three word sequences.


## Are There Bugs That You Are Aware Of
No bugs that I am aware of

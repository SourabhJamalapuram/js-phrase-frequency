## How To Run The Program

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


## Are There Bugs That You Are Aware Of

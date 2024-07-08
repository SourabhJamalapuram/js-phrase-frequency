FROM node:18
COPY main.js / 
COPY files/test-file1.txt / 
COPY files/test-file2.txt /

ENTRYPOINT ["node", "main.js"]


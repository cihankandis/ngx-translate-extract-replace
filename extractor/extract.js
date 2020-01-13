const fs = require('fs');
const htmlparser2 = require("htmlparser2");
const path = require('path');
const dirReader = require('../dir-reader/dir-reader');

const projectDirectory = "../admin/ta-fe-admin-mod/src/app";

const keyValueMap = {};
let counter = 0;
const keyFileMap = new Map();

let lastClosedTag = '';

const extractor = () => {

  console.log('Reading directory..');
  dirReader(projectDirectory, '.html', (error, htmlFiles) => {
    
    console.log('Extracting text from each file..');
    
    htmlFiles.forEach(file => {
      extractTextFromFile(file);
    });

    writeToFile(keyValueMap);
    console.log('output file is created');

    console.log('replacing in file started');
    replaceInFile();

  });
};

const replaceInFile = () => {
  for (var key in keyValueMap) {
    const value = keyValueMap[key];
    const file = keyFileMap.get(key);

    if (file) {
      var data = fs.readFileSync(file, 'utf8');

      var result = data.replace(value, ' {{\'' + key + '\' | translate}} ');

      fs.writeFileSync(file, result, 'utf8');
    }
  }
}

const extractTextFromFile = (file) => {
  const htmlParser = new htmlparser2.Parser(
    {
      ontext(text) {
        
        text = text.trim();
        if (text && text.length > 1 && text.indexOf(' ') > 0 && text.indexOf('{{') < 0 && text.indexOf('}}') < 0) {

          console.log(file, lastClosedTag, text);

          counter++;
          const key = createKeyFromText(text, counter);
          const keyPath = createKeyFromFile(file);

          const combinedKey = keyPath + '_' + key;
          keyFileMap.set(combinedKey, file);
          keyValueMap[combinedKey] = text;
        }
      },
      onclosetag(name) {
        lastClosedTag = name;
      }
    },
    { decodeEntities: true }
  )
  var contents = fs.readFileSync(file, 'utf8');
  htmlParser.write(contents);
  htmlParser.end();
}

const createKeyFromText = (text, counter) => {
  const words = text.split(' ');
  let key = '';
  if (words.length) {
    words.forEach((word, index) => {
      if (word && index < 3) {
        key = key.concat(word);
      }
    })
    key = removeSingleQuote(key);
    key = removeNewLine(key);
    key = removePunctuation(key);
    key = counter + '__' + key;
  }
  
  return key.toUpperCase();
}

const createKeyFromFile = (file) => {
  let keyPath = file;
  const indApp = keyPath.indexOf('app');
  const indPages = keyPath.indexOf('pages');
  if (indPages > 0) {
    keyPath = keyPath.substr(indPages + 6);
    const indexSlash = keyPath.indexOf('/');
    if (indexSlash > 0) {
      keyPath = keyPath.substring(0, indexSlash)
    }
  } else if (indApp > 0) {
    keyPath = keyPath.substr(indApp + 4);
    const indexSlash = keyPath.indexOf('/');
    if (indexSlash > 0) {
      keyPath = keyPath.substring(0, indexSlash)
    }
  }

  return keyPath.toUpperCase();
  
}

const writeToFile = (output) => {
  let words = JSON.stringify(output, null, 2);

  fs.writeFile('../../output.json', words, (err) => {
    if (err) throw err;
    console.log('Data written to file');
  });
}

const removePunctuation = (str) => {
  return str.replace(/[!"#$%&'’()*+,-./:;<=>?@[\]^_`{|}~]/g, "")
}

const removeNewLine = (str) => {
  return str.replace(/\r?\n|\r/g);
}

const removeSingleQuote = (str) => {
  return str.replace(/\'/gi,'');
}

module.exports = extractor;
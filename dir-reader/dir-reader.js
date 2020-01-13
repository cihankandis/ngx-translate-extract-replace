const fs = require('fs');
const path = require('path');

/*
  Recursively reads the directory and returns all files as an array.
  if fileExtension is not null, then will return all files with given extension.
*/

const dirReader = (dir, fileExtension, done) => {
  let results = [];
  fs.readdir(dir, (err, list) => {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);

    list.forEach((file) => {
      file = path.resolve(dir, file);

      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          dirReader(file, fileExtension, (err, res) => {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          if (!fileExtension || fileExtension === path.extname(file)) {
            results.push(file);
          }
          if (!--pending) done(null, results);
        }
      });
    })
  });
}

module.exports = dirReader;
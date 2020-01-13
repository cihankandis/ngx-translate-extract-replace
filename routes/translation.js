const userRoutes = (app, fs) => {

  // variables
  let dataPath = './data/';

  // READ
  app.get('/translation/:lang', (req, res) => {
    const path = dataPath + req.params.lang + '.json';
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) {
        throw err;
      }

      res.send(JSON.parse(data));
    });
  });
};

module.exports = userRoutes;
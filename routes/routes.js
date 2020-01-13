const translationRoute = require('./translation');

const appRouter = (app, fs) => {
  translationRoute(app, fs);
};

module.exports = appRouter;
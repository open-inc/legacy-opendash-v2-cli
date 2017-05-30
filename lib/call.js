// Usage:
//
// const call = require('../lib/call');
//
// call(async () => {
//
// });

module.exports = (callback) => {
  callback().then().catch((err) => {
    console.error('\nThere was an Error while running open.DASH CLI:\n');
    console.error(err);
  });
};

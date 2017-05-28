// Usage:
//
// const call = require('../lib/call');
//
// call(async () => {
//
// });

module.exports = (callback) => {
  callback().then().catch(err => console.error(err));
};

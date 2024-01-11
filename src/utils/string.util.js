/**
 * @param {number} length
 * @return {string}
 */
function randomStr(length) {
  const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i += 1) {
    result += char[Math.floor(Math.random() * char.length)];
  }

  return result;
}

module.exports = randomStr;

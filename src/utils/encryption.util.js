const crypto = require('crypto');
const config = require('../configs/general.config');

const key = crypto
  .createHash('sha256')
  .update(config.cryptoSecret)
  .digest('base64')
  .substring(0, 32);

const iv = crypto.createHash('sha256').update(config.cryptoIv).digest('base64').substring(0, 16);

/**
 * @param {string} text
 * @return {string}
 */
function encrypt(text) {
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString('hex');
}

/**
 * @param {string} text
 * @return {string}
 */
function decrypt(text) {
  const encryptedText = Buffer.from(text, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

module.exports = { encrypt, decrypt };

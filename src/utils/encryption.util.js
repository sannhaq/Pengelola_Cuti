const crypto = require('crypto');
const config = require('../configs/general.config');

const key = crypto
  .createHash('sha512')
  .update(config.encryption_key)
  .digest('hex')
  .substring(0, 32);

const iv = crypto.createHash('sha512').update(config.encryption_iv).digest('hex').substring(0, 16);

/**
 * @param {string} text
 * @return {string}
 */
function encrypt(text) {
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return encrypted.toString('hex');
}

/**
 * @param {string} text
 * @return {string}
 */
function decrypt(text) {
  const encryptedText = Buffer.from(text, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);

  return decrypted.toString();
}

module.exports = { encrypt, decrypt };

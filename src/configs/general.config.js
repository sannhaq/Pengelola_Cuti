require('dotenv').config();

module.exports = {
  port: process.env.PORT,
  secret: process.env.SECRET_KEY,
  host: process.env.HOST,
  encryption_key: process.env.ENCRYPTION_KEY,
  cryptoIv: process.env.ENCRYPTION_IV,
  cryptoSecret: process.env.CRYPTO_SECRET_KEY,
  cors: process.env.FE_IP,
};

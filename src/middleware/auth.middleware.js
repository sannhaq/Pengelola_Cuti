const jwt = require('jsonwebtoken');
const { prisma } = require('../configs/prisma.config');
const config = require('../configs/general.config');
const { errorResponse } = require('../utils/helper.util');

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function auth(req, res, next) {
  try {
    // Gets the access token from the Authorization header
    const authorizationHeader = req.header('Authorization');
    if (!authorizationHeader) {
      return errorResponse(res, 'Authorization header is missing', '', 408);
    }
    const accessToken = authorizationHeader.split(' ')[1];
    // Decoding access tokens
    const decode = jwt.verify(accessToken, config.secret);
    // Investigate users based on the ID contained in the token
    req.user = await prisma.user.findUniqueOrThrow({
      where: {
        id: parseInt(decode.sub, 10),
      },
      include: {
        role: true,
      },
    });
    return next();
  } catch (e) {
    console.log(e);
    return errorResponse(res, 'Unauthenticated', '', 408);
  }
}

module.exports = auth;

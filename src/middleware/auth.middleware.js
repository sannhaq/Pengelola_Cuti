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
    // Mendapatkan token akses dari header Authorization
    const authorizationHeader = req.header('Authorization');
    if (!authorizationHeader) {
      return errorResponse(res, 'Authorization header is missing', '', 408);
    }
    const accessToken = authorizationHeader.split(' ')[1];
    // Mendekode token akses
    const decode = jwt.verify(accessToken, config.secret);
    // Menyelidiki pengguna berdasarkan ID yang ada dalam token
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

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { prisma } = require('../configs/prisma.config');
const { errorResponse, successResponse } = require('../utils/helper.util');
const randomStr = require('../utils/string.util');
const { encrypt, decrypt } = require('../utils/encryption.util');
const config = require('../configs/general.config');

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function login(req, res) {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return errorResponse(res, 'Email not found', '', 404);
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return errorResponse(res, 'Wrong password', '', 401);
  }

  const employee = await prisma.employee.findUnique({
    where: { userId: user.id },
    select: { nik: true },
  });

  const expires = new Date(Date.now() + 1000 * 3600 * 24 * 30); // Expires in 30 days
  const refreshToken = await prisma.userToken.create({
    data: {
      userId: user.id,
      refreshToken: randomStr(100),
      expired_at: expires,
    },
  });

  const encryptedRefreshToken = encrypt(refreshToken.refreshToken);
  res.cookie('refresh_token', encryptedRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    expires,
  });

  const accessToken = jwt.sign({}, config.secret, {
    expiresIn: '15m',
    subject: user.id.toString(),
  });

  const userData = { user, accessToken, encryptedRefreshToken, employee };
  delete userData.user.password;
  return successResponse(res, 'Login success', { user, accessToken, employee });
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function refresh(req, res) {
  let refreshToken;

  try {
    refreshToken = decrypt(req.cookies.refresh_token);
    refreshToken = await prisma.userToken.findUniqueOrThrow({
      where: { refreshToken },
    });
  } catch (e) {
    console.log(e);
    return errorResponse(res, 'Invalid refresh token');
  }

  if (Date.now() > refreshToken.expired_at.getTime()) {
    return errorResponse(res, 'Refresh token expired', '', 408);
  }

  await prisma.userToken.delete({ where: { id: refreshToken.id } });

  const expires = new Date(Date.now() + 1000 * 3600 * 24 * 30); // Expires in 30 days
  const newRefreshToken = await prisma.userToken.create({
    data: {
      userId: refreshToken.userId,
      refreshToken: randomStr(64),
      expired_at: expires,
    },
  });

  res.cookie('refresh_token', encrypt(newRefreshToken.refreshToken), {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    expires,
  });

  const accessToken = jwt.sign({}, config.secret, {
    expiresIn: '15m',
    subject: newRefreshToken.userId.toString(),
  });

  return successResponse(res, 'Refresh token success', { accessToken });
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function logout(req, res) {
  try {
    const refreshToken = decrypt(req.cookies.refresh_token);
    await prisma.userToken.delete({ where: { refreshToken } });
  } catch {
    return errorResponse(res, 'Invalid refresh token');
  }

  res.clearCookie('refresh_token');
  return successResponse(res, 'Logout success');
}

async function me(req, res) {
  try {
    const userId = req.user.id;

    const employee = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        employee: {
          select: {
            nik: true,
            name: true,
          },
        },
      },
    });

    if (!employee) {
      return errorResponse(res, 'user not found', '', 404);
    }

    return successResponse(res, 'Me success', employee);
  } catch {
    return errorResponse(res, 'Internal server error', '', 500);
  }
}

module.exports = { login, refresh, logout, me };

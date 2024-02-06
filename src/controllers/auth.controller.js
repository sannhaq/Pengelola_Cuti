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

  // Check if the user exists
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return errorResponse(res, 'Email not found', null, 404);
  }

  // Compare the provided password with the stored password hash
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return errorResponse(res, 'Wrong password', null, 401);
  }

  // Check if the user is an active employee
  const employee = await prisma.employee.findUnique({
    where: { userId: user.id },
    select: { nik: true, isWorking: true },
  });

  if (!employee || !employee.isWorking) {
    return errorResponse(res, 'You are no longer an employee', null, 401);
  }

  // Generate refresh token and set it as a cookie
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

  // Generate access token
  const accessToken = jwt.sign({}, config.secret, {
    expiresIn: '1m',
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
    // Decrypt the refresh token from the cookie
    refreshToken = decrypt(req.cookies.refresh_token);
    // Find the corresponding user token from the database
    refreshToken = await prisma.userToken.findUniqueOrThrow({
      where: { refreshToken },
    });
  } catch (e) {
    return errorResponse(res, 'Invalid refresh token');
  }

  // Check if the refresh token has expired
  if (Date.now() > refreshToken.expired_at.getTime()) {
    return errorResponse(res, 'Refresh token expired', '', 408);
  }

  // Delete the used refresh token
  await prisma.userToken.delete({ where: { id: refreshToken.id } });

  // Generate a new refresh token and store it in the database
  const expires = new Date(Date.now() + 1000 * 3600 * 24 * 30); // Expires in 30 days
  const newRefreshToken = await prisma.userToken.create({
    data: {
      userId: refreshToken.userId,
      refreshToken: randomStr(64),
      expired_at: expires,
    },
  });

  // Set the new refresh token as a cookie
  res.cookie('refresh_token', encrypt(newRefreshToken.refreshToken), {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    expires,
  });

  // Generate a new access token
  const accessToken = jwt.sign({}, config.secret, {
    expiresIn: '1m',
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
    // Decrypt the refresh token from the cookie
    const refreshToken = decrypt(req.cookies.refresh_token);
    // Delete the user token associated with the refresh token
    await prisma.userToken.delete({ where: { refreshToken } });
  } catch {
    return errorResponse(res, 'Invalid refresh token');
  }
  // Clear the refresh token cookie on the client side
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

function sum(a, b) {
  return a + b;
}

function errorResponse(res, message, data, code = 500) {
  res.status(code).json({ success: false, message, data });
}

/**
 * @param {import('express').Response} res
 */

function successResponse(res, message, data, code = 200) {
  res.status(code).json({ success: true, message, data });
}

module.exports = {
  sum,
  successResponse,
  errorResponse,
}
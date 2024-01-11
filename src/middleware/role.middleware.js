const errorResponse = require('../utils/helper.util');

/**
 * @param {string[]} roles
 */
function role(...roles) {
  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  return (req, res, next) => {
    if (!roles.includes(req.user.role.name)) {
      return errorResponse(res, 'Unauthorized', '', 403);
    }

    return next();
  };
}

module.exports = role;

const { errorResponse } = require('../utils/helper.util');

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
    // Check if the user's role is included in the allowed roles
    if (!roles.includes(req.user.role.name)) {
      // Return an unauthorized response if the role is not allowed
      return errorResponse(res, 'Unauthorized', '', 403);
    }

    // Continue to the next middleware or route if the role is allowed
    return next();
  };
}

module.exports = role;

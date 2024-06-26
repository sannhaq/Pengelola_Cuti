const { z } = require('zod');
const { errorResponse } = require('../utils/helper.util');

/**
 * @param {object} schema
 */
const validate = function validateMiddleware(inputSchema) {
  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  return async (req, res, next) => {
    let schema = inputSchema;

    // If schema is a function, call it to get the schema
    if (typeof schema === 'function') {
      schema = schema(req.params.id);
    }

    try {
      // Parse request data against the schema based on the HTTP method
      if (req.method === 'GET') {
        req.query = await z.object(schema).strict().parseAsync(req.query);
      } else {
        req.body = await z.object(schema).strict().parseAsync(req.body);
      }
    } catch (e) {
      console.log(e);
      return errorResponse(res, 'All required fields', e.errors, 422);
    }

    // Continue to the next middleware or route if validation is successful
    return next();
  };
};

module.exports = { validate };

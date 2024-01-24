const { z } = require('zod');

function sum(a, b) {
  return a + b;
}

/**
 * Paginate data from a Prisma model.
 *
 * @param {object} defaultOptions - Default pagination options.
 * @param {number} defaultOptions.perPage - Number of items per page.
 * @returns {Function} - A function for paginating Prisma model data.
 */

function paginator(defaultOptions) {
  return async (model, options, args = { where: undefined }) => {
    try {
      const page = Number(options?.page || defaultOptions.page) || 1;
      const perPage = Number(options?.perPage || defaultOptions.perPage) || 10;

      const skip = (page - 1) * perPage;
      const [data, total] = await Promise.all([
        model.findMany({
          ...args,
          skip,
          take: perPage,
        }),
        model.count({
          where: args.where,
        }),
      ]);
      const lastPage = Math.ceil(total / perPage);

      return {
        data,
        meta: {
          total,
          currPage: page,
          lastPage,
          perPage,
          skip,
          take: perPage,
          prev: page > 1 ? page - 1 : null,
          next: page < lastPage ? page + 1 : null,
        },
      };
    } catch (error) {
      console.error('Pagination error:', error.message || error);
      throw error;
    }
  };
}

const paginate = paginator({ perPage: 10 });

/**
 * @param {import('express').Response} res
 */
function errorResponse(res, message, data, code = 500) {
  res.status(code).json({ success: false, message, data });
}

/**
 * @param {import('express').Response} res
 */
function successResponse(res, message, data, code = 200) {
  res.status(code).json({ success: true, message, data });
}

function successResponseWithPage(res, message, data, code, meta = 200) {
  res.status(code).json({ success: true, message, data, meta });
}

function calculateLeaveAmount(startLeave, endLeave) {
  const startDate = new Date(startLeave);
  const endDate = new Date(endLeave);

  const timeDifference = Math.abs(endDate - startDate);
  const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

  return daysDifference;
}

function formatDateObjectToDDMMYYYY(dateObject) {
  const date = new Date(dateObject);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

function formatEmployeeData(data) {
  return data.map((item) => ({
    ...item,
    positions: {
      ...item.positions,
      name: item.isWorking ? item.positions.name : '-',
    },
    typeOfEmployee: {
      ...item.typeOfEmployee,
      startContract: formatDateObjectToDDMMYYYY(item.typeOfEmployee.startContract),
      endContract: formatDateObjectToDDMMYYYY(item.typeOfEmployee.endContract),
    },
  }));
}

function formatLeaveHistoryData(data) {
  return data.map((item) => ({
    ...item,
    startLeave: formatDateObjectToDDMMYYYY(item.startLeave),
    endLeave: formatDateObjectToDDMMYYYY(item.endLeave),
  }));
}

function validate(scheme) {
  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  return (req, res, next) => {
    try {
      scheme.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      return next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return errorResponse(res, error.errors[0].message, null, 400);
      }
      return errorResponse(res, 'Internal server error', error.message, 500);
    }
  };
}

module.exports = {
  sum,
  successResponse,
  errorResponse,
  successResponseWithPage,
  paginate,
  calculateLeaveAmount,
  formatDateObjectToDDMMYYYY,
  formatEmployeeData,
  formatLeaveHistoryData,
  validate,
};

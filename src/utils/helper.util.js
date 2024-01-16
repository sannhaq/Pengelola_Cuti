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

function formatDateObjectToDDMMYYYY(dateObject) {
  const date = new Date(dateObject);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function formatLeaveHistoryData(data) {
  return data.map((item) => ({
    ...item,
    startLeave: formatDateObjectToDDMMYYYY(item.startLeave),
    endLeave: formatDateObjectToDDMMYYYY(item.endLeave),
  }));
}

function calculateLeaveAmount(startLeave, endLeave) {
  const startDate = new Date(startLeave);
  const endDate = new Date(endLeave);

  const timeDifference = Math.abs(endDate - startDate);
  const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

  return daysDifference;
}

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
          skip, // tambahkan ini
          take: perPage, // tambahkan ini
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

module.exports = {
  sum,
  successResponse,
  errorResponse,
  calculateLeaveAmount,
  formatLeaveHistoryData,
  paginate,
};

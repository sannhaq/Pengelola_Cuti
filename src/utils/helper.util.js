const { z } = require('zod');
const fs = require('fs');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

  let totalDays = 0;

  while (startDate <= endDate) {
    const dayOfWeek = startDate.getDay();

    // Jika bukan Sabtu (6) atau Minggu (0), tambahkan ke totalDays
    if (dayOfWeek !== 6 && dayOfWeek !== 0) {
      totalDays++;
    }

    // Tambah satu hari ke startDate
    startDate.setDate(startDate.getDate() + 1);
  }

  return totalDays;
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

async function updateLeaveAmount(employeeNik, deductionInfo, operation) {
  let today = new Date();
  let currentYear = today.getFullYear();
  let previousYear = currentYear - 1;

  const amountOfLeave = await prisma.amountOfLeave.findMany({
    where: { employeeNik: employeeNik },
    select: {
      id: true,
      year: true,
    },
  });

  for (const entry of amountOfLeave) {
    if (
      entry.year === previousYear &&
      deductionInfo.previousYearDeduct !== null &&
      deductionInfo.previousYearDeduct !== 0
    ) {
      await prisma.amountOfLeave.update({
        where: { id: entry.id },
        data: { amount: { [operation]: deductionInfo.previousYearDeduct } }, // Menggunakan parameter operasi
      });
    }
    if (
      entry.year === currentYear &&
      deductionInfo.currentYearDeduct !== null &&
      deductionInfo.currentYearDeduct !== 0
    ) {
      await prisma.amountOfLeave.update({
        where: { id: entry.id },
        data: { amount: { [operation]: deductionInfo.currentYearDeduct } }, // Menggunakan parameter operasi
      });
    }
  }
}

// file

function getFilePath(url) {
  const fileName = url.split('/').pop();
  return `./public/assets/images/${fileName}`;
}

function generateAssetUrl(fileName) {
  return `${process.env.BASE_URL}/public/assets/images/${fileName}`;
}

function deleteAsset(path) {
  if (fs.existsSync(path) && !path.split('/').pop() === '') {
    fs.unlinkSync(path);
  }
}

function setStorage() {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/assets/images');
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });

  return storage;
}

function setFileFilter(allowedTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/svg+xml']) {
  return (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error('Incorrect file');
      error.code = 'INCORRECT_FILETYPE';
      cb(error, false);
    }
    cb(null, true);
  };
}

/**
 * @param {import('multer').Options} options
 */

function uploadFile(options, fieldName = 'image') {
  const upload = multer(options).single(fieldName);

  return (req, res, next) =>
    upload(req, res, (err) => {
      if (err) {
        return errorResponse(res, err.message, null, 422);
      }
      if (!req.file) {
        return errorResponse(res, `${fieldName} is required`, null, 400);
      }
      return next();
    });
}

// file-end

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
  updateLeaveAmount,
  getFilePath,
  generateAssetUrl,
  deleteAsset,
  setStorage,
  setFileFilter,
  uploadFile,
};

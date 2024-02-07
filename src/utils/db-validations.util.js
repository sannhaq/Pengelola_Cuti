const { prisma } = require('../configs/prisma.config');

/**
 * @param {string} model
 */
function fieldExist(model) {
  /**
   * @param {string} field
   * @return {boolean}
   */
  return (field) => field in prisma[model].fields;
}

/**
 * @param {string} except
 * @param {string} field
 * @param {?number} except
 */
function recordUnique(model, field, exceptId = 0) {
  /**
   * @param {string} value
   * @return {Promise<boolean>}
   */
  return async (val) => {
    const record = await prisma[model].findFirst({
      where: {
        [field]: val,
      },
    });

    return record === null || record.id == exceptId;
  };
}

/**
 * @param {string} model
 * @param {string} field
 */
function recordExist(model, field) {
  /*
   * @param {string} val
   * @return {Promise<boolean>}
   */
  return async (val) => {
    const record = await prisma[model].findFirst({
      where: {
        [field]: val,
      },
    });

    return record !== null;
  };
}

module.exports = { fieldExist, recordExist, recordUnique };

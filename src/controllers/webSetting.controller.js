const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const {
  errorResponse,
  successResponse,
  getFilePath,
  generateAssetUrl,
  deleteAsset,
} = require('../utils/helper.util');

/**
 * Get Web Setting Color
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response with the web setting color
 */
async function getWebSettings(req, res) {
  try {
    // Retrieve all web settings from the database
    const webSettings = await prisma.webSetting.findMany();

    // Return success response with the web settings
    return successResponse(res, 'Web settings retrieved successfully', webSettings, 200);
  } catch (error) {
    // Handle error and return error response
    console.error('Failed to get web settings:', error);
    return errorResponse(
      res,
      'Failed to get web settings',
      error.message || 'Internal server error',
      500,
    );
  }
}

/**
 * Create or Update Web Setting Color
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response indicating success or failure
 */
async function createWebSettings(req, res) {
  // Extract color from request body
  const { color } = req.body;

  try {
    // Create a new web setting with the provided color
    await prisma.webSetting.create({
      data: {
        webColorCode: color,
      },
    });

    // Return success response
    return successResponse(res, 'Web setting color created successfully', {}, 201);
  } catch (error) {
    // Handle error and return error response
    console.error('Failed to create web setting color:', error);
    return errorResponse(
      res,
      'Failed to create web setting color',
      error.message || 'Internal server error',
      500,
    );
  }
}

async function updateWebColor(req, res) {
  const webSettingId = parseInt(req.params.id, 10);
  // Extract color code from request body
  const { colorCode } = req.body;

  try {
    // Update the web color code in the database
    const updatedWebSetting = await prisma.webSetting.update({
      where: {
        id: webSettingId,
      },
      data: {
        webColorCode: colorCode,
      },
    });

    // Return success response with the updated web setting color
    return successResponse(res, 'Web color setting updated successfully', updatedWebSetting, 200);
  } catch (error) {
    // Handle error and return error response
    console.error('Failed to update web color setting:', error);
    return errorResponse(
      res,
      'Failed to update web color setting',
      error.message || 'Internal server error',
      500,
    );
  }
}

async function updateImageLogo(req, res) {
  const webSettingId = req.params.id;

  try {
    // Find the web setting by its unique ID
    const webSetting = await prisma.webSetting.findUnique({
      where: {
        id: parseInt(webSettingId),
      },
      select: {
        id: true,
        picture: true,
      },
    });

    // Check if the web setting is not found
    if (!webSetting) {
      return errorResponse(res, 'Web setting not found', '', 404);
    }

    let updatedWebSetting;

    // Update the logo image URL in the database only if a new file is uploaded
    if (req.file) {
      updatedWebSetting = await prisma.webSetting.update({
        where: {
          id: parseInt(webSettingId),
        },
        data: {
          picture: generateAssetUrl(req.file.filename),
        },
      });

      // Delete the old image from the server
      if (webSetting.picture) {
        const oldFileName = webSetting.picture.split('/').pop();
        const oldFilePath = getFilePath(oldFileName);
        deleteAsset(oldFilePath);
      }
    } else {
      // No new file uploaded, return the current web setting without updating
      updatedWebSetting = webSetting;
    }

    // Return success response with the updated web setting
    return successResponse(res, 'Logo image updated successfully', updatedWebSetting, 200);
  } catch (error) {
    // Handle error and return error response
    console.error('Failed to update logo image:', error);

    // Rollback deletion of the new image if an error occurs
    if (req.file) {
      const filePath = getFilePath(req.file.filename);
      deleteAsset(filePath);
    }

    return errorResponse(
      res,
      'Failed to update logo image',
      error.message || 'Internal server error',
      500,
    );
  }
}

module.exports = {
  getWebSettings,
  createWebSettings,
  updateWebColor,
  updateImageLogo,
};

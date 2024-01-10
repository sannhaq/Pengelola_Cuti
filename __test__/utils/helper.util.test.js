const response = require('../../src/utils/helper.util');
const express = require('express');
const app = express();

test('adds 1 + 2 to equal 3', () => {
  expect(response.sum(1, 2)).toBe(3);
});

describe('errorResponse', () => {
  it('Should get error response', () => {
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
    response.errorResponse(res, 'error', {}, 500);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'error',
      data: {},
    });
  });
});

describe('successResponse', () => {
  it('Should get success response', () => {
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
    response.successResponse(res, 'success', {}, 200);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'success',
      data: {},
    });
  });
});

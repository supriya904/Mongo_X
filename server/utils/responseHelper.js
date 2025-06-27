// Standard API response format
const successResponse = (message = 'Success', data = null, statusCode = 200) => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

// Error response format
const errorResponse = (message = 'Internal Server Error', errors = null, statusCode = 500) => {
  return {
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString()
  };
};

// Paginated response format
const paginatedResponse = (message = 'Success', data = null, page = 1, limit = 20, total = 0) => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;
  
  return {
    success: true,
    message,
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNext,
      hasPrev
    },
    timestamp: new Date().toISOString()
  };
};

// Response with status helpers
const sendSuccessResponse = (res, message = 'Success', data = null, statusCode = 200) => {
  return res.status(statusCode).json(successResponse(message, data, statusCode));
};

const sendErrorResponse = (res, message = 'Internal Server Error', errors = null, statusCode = 500) => {
  return res.status(statusCode).json(errorResponse(message, errors, statusCode));
};

const sendPaginatedResponse = (res, message = 'Success', data = null, page = 1, limit = 20, total = 0) => {
  return res.status(200).json(paginatedResponse(message, data, page, limit, total));
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
  sendSuccessResponse,
  sendErrorResponse,
  sendPaginatedResponse
};

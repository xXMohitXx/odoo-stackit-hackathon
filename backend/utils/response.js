/**
 * Send a successful response with data
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {object|array} data - Data to send
 * @param {object} meta - Additional metadata
 */
exports.success = (res, statusCode = 200, data, meta = {}) => {
  const response = {
    success: true,
    ...meta
  };

  if (data) {
    // If data is an array, include count
    if (Array.isArray(data)) {
      response.count = data.length;
    }
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send an error response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 */
exports.error = (res, statusCode = 500, message = 'Server Error') => {
  return res.status(statusCode).json({
    success: false,
    error: message
  });
};

/**
 * Create pagination result
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 */
exports.getPagination = (page, limit, total) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  pagination.total = total;
  pagination.pages = Math.ceil(total / limit);
  pagination.current = page;

  return pagination;
};
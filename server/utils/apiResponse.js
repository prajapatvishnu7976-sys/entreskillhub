// ============================================
// EntreSkillHub - Standardized API Response
// Consistent response format across all APIs
// ============================================

class ApiResponse {
  // ============================================
  // SUCCESS RESPONSES
  // ============================================

  /**
   * 200 OK - Success response
   */
  static success(res, message = 'Success', data = null, meta = null) {
    const response = {
      success: true,
      status: 'success',
      statusCode: 200,
      message,
      timestamp: new Date().toISOString(),
    };

    if (data !== null) response.data = data;
    if (meta !== null) response.meta = meta;

    return res.status(200).json(response);
  }

  /**
   * 201 Created - Resource created successfully
   */
  static created(res, message = 'Resource created successfully', data = null) {
    const response = {
      success: true,
      status: 'success',
      statusCode: 201,
      message,
      timestamp: new Date().toISOString(),
    };

    if (data !== null) response.data = data;

    return res.status(201).json(response);
  }

  /**
   * 202 Accepted - Request accepted for processing
   */
  static accepted(res, message = 'Request accepted', data = null) {
    return res.status(202).json({
      success: true,
      status: 'success',
      statusCode: 202,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 204 No Content - Success with no data
   */
  static noContent(res) {
    return res.status(204).send();
  }

  /**
   * Paginated Response
   */
  static paginated(res, message, data, pagination) {
    return res.status(200).json({
      success: true,
      status: 'success',
      statusCode: 200,
      message,
      data,
      pagination: {
        currentPage: pagination.currentPage || 1,
        totalPages: pagination.totalPages || 1,
        totalItems: pagination.totalItems || 0,
        itemsPerPage: pagination.itemsPerPage || 10,
        hasNext: pagination.hasNext || false,
        hasPrev: pagination.hasPrev || false,
        nextPage: pagination.hasNext ? pagination.currentPage + 1 : null,
        prevPage: pagination.hasPrev ? pagination.currentPage - 1 : null,
      },
      timestamp: new Date().toISOString(),
    });
  }

  // ============================================
  // CLIENT ERROR RESPONSES (4xx)
  // ============================================

  /**
   * 400 Bad Request
   */
  static badRequest(res, message = 'Bad request', errors = null) {
    const response = {
      success: false,
      status: 'fail',
      statusCode: 400,
      message,
      timestamp: new Date().toISOString(),
    };

    if (errors !== null) response.errors = errors;

    return res.status(400).json(response);
  }

  /**
   * 401 Unauthorized
   */
  static unauthorized(res, message = 'Unauthorized access') {
    return res.status(401).json({
      success: false,
      status: 'fail',
      statusCode: 401,
      message,
      errorCode: 'UNAUTHORIZED',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 403 Forbidden
   */
  static forbidden(res, message = 'Access forbidden') {
    return res.status(403).json({
      success: false,
      status: 'fail',
      statusCode: 403,
      message,
      errorCode: 'FORBIDDEN',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 404 Not Found
   */
  static notFound(res, message = 'Resource not found') {
    return res.status(404).json({
      success: false,
      status: 'fail',
      statusCode: 404,
      message,
      errorCode: 'NOT_FOUND',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 405 Method Not Allowed
   */
  static methodNotAllowed(res, message = 'Method not allowed') {
    return res.status(405).json({
      success: false,
      status: 'fail',
      statusCode: 405,
      message,
      errorCode: 'METHOD_NOT_ALLOWED',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 409 Conflict
   */
  static conflict(res, message = 'Resource conflict', details = null) {
    const response = {
      success: false,
      status: 'fail',
      statusCode: 409,
      message,
      errorCode: 'CONFLICT',
      timestamp: new Date().toISOString(),
    };

    if (details !== null) response.details = details;

    return res.status(409).json(response);
  }

  /**
   * 422 Unprocessable Entity
   */
  static unprocessableEntity(res, message = 'Validation failed', errors = null) {
    return res.status(422).json({
      success: false,
      status: 'fail',
      statusCode: 422,
      message,
      errorCode: 'VALIDATION_ERROR',
      errors,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 429 Too Many Requests
   */
  static tooManyRequests(res, message = 'Too many requests', meta = null) {
    const response = {
      success: false,
      status: 'fail',
      statusCode: 429,
      message,
      errorCode: 'RATE_LIMIT_EXCEEDED',
      timestamp: new Date().toISOString(),
    };

    if (meta !== null) response.meta = meta;

    return res.status(429).json(response);
  }

  // ============================================
  // SERVER ERROR RESPONSES (5xx)
  // ============================================

  /**
   * 500 Internal Server Error
   */
  static serverError(res, message = 'Internal server error', error = null) {
    const response = {
      success: false,
      status: 'error',
      statusCode: 500,
      message,
      errorCode: 'INTERNAL_SERVER_ERROR',
      timestamp: new Date().toISOString(),
    };

    if (error !== null && process.env.NODE_ENV === 'development') {
      response.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    return res.status(500).json(response);
  }

  /**
   * 502 Bad Gateway
   */
  static badGateway(res, message = 'Bad gateway') {
    return res.status(502).json({
      success: false,
      status: 'error',
      statusCode: 502,
      message,
      errorCode: 'BAD_GATEWAY',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 503 Service Unavailable
   */
  static serviceUnavailable(res, message = 'Service temporarily unavailable') {
    return res.status(503).json({
      success: false,
      status: 'error',
      statusCode: 503,
      message,
      errorCode: 'SERVICE_UNAVAILABLE',
      timestamp: new Date().toISOString(),
    });
  }

  // ============================================
  // CUSTOM RESPONSES
  // ============================================

  /**
   * Custom response with any status code
   */
  static custom(res, statusCode, message, data = null, extras = {}) {
    const response = {
      success: statusCode >= 200 && statusCode < 300,
      status: statusCode >= 500 ? 'error' : statusCode >= 400 ? 'fail' : 'success',
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      ...extras,
    };

    if (data !== null) response.data = data;

    return res.status(statusCode).json(response);
  }

  /**
   * File download response
   */
  static download(res, filePath, fileName = null) {
    if (fileName) {
      return res.download(filePath, fileName);
    }
    return res.download(filePath);
  }

  /**
   * Send Cookie with response
   */
  static withCookie(res, statusCode, message, data, cookieName, cookieValue, cookieOptions = {}) {
    const defaultOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    };

    res.cookie(cookieName, cookieValue, { ...defaultOptions, ...cookieOptions });

    return res.status(statusCode).json({
      success: statusCode >= 200 && statusCode < 300,
      status: statusCode >= 400 ? 'fail' : 'success',
      statusCode,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Clear cookie
   */
  static clearCookie(res, cookieName, message = 'Cookie cleared') {
    res.clearCookie(cookieName);
    return res.status(200).json({
      success: true,
      status: 'success',
      statusCode: 200,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = ApiResponse;
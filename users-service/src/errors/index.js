const AppError = require('./AppError');

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(message, 404);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 400);
  }
}

class InvalidCredentialsError extends AppError {
  constructor(message = 'Invalid credentials') {
    super(message, 401);
  }
}

module.exports = {
  AppError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
  InvalidCredentialsError,
};



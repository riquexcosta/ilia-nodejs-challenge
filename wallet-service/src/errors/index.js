const AppError = require('./AppError');

class InsufficientBalanceError extends AppError {
  constructor(message = 'Insufficient balance') {
    super(message, 400);
  }
}

module.exports = {
  AppError,
  InsufficientBalanceError,
};



const { AppError } = require('../errors');

const errorHandler = (err, req, res, next) => {
  // Known application errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // SyntaxError from JSON parsing is handled earlier, but guard just in case
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON format' });
  }

  console.error('Error:', err);
  return res.status(500).json({ error: 'Internal server error' });
};

module.exports = errorHandler;



const { AppError } = require('../errors');

const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON format' });
  }

  console.error('Error:', err);
  return res.status(500).json({ error: 'Internal server error' });
};

module.exports = errorHandler;



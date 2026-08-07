function notFoundHandler(req, res) {
  res.status(404).json({ message: 'Resource not found' });
}

function errorHandler(err, req, res) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};

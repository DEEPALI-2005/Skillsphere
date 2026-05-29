const errorMiddleware = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Server Error';
  
    if (err.code === 11000) {
      message = 'Email already exists';
      statusCode = 400;
    }
  
    if (err.name === 'ValidationError') {
      message = Object.values(err.errors).map(e => e.message).join(', ');
      statusCode = 400;
    }
  
    res.status(statusCode).json({
      success: false,
      message
    });
  };
  
  module.exports = errorMiddleware;
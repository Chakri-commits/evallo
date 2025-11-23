const errorHandler = (err, req, res, next) => {
    console.error('Error occurred:', err);

    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({
            error: 'Validation error',
            message: err.errors.map(e => e.message).join(', ')
        });
    }

    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
            error: 'Duplicate entry',
            message: 'A record with this information already exists'
        });
    }

    if (err.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({
            error: 'Invalid reference',
            message: 'Referenced record does not exist'
        });
    }

    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'development'
        ? err.message
        : 'An unexpected error occurred';

    res.status(statusCode).json({
        error: err.name || 'ServerError',
        message: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;

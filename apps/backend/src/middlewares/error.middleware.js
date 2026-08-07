import ApiError from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {

    // If the error isn't an ApiError, create one
    if (!(err instanceof ApiError)) {
        err = new ApiError(
            500,
            err.message || "Internal Server Error"
        );
    }

    return res.status(err.statusCode).json({
        success: err.success,
        statusCode: err.statusCode,
        message: err.message,
        errors: err.errors,
        stack:
            process.env.NODE_ENV === "development"
                ? err.stack
                : undefined,
    });
};

export default errorHandler;
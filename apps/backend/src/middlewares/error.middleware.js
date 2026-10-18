import ApiError from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {

    console.error("========== ERROR ==========");
    console.error(err);
    console.error(err.stack);
    console.error("==========================");
    // Map known Mongoose errors to appropriate client status codes
    if (err.name === "ValidationError") {
        const message = Object.values(err.errors || {})
            .map((val) => val.message)
            .join(", ");
        err = new ApiError(400, message || "Validation Error", Object.values(err.errors || {}));
    } else if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || "Field";
        err = new ApiError(409, `${field} is already registered`);
    } else if (!(err instanceof ApiError)) {
        err = new ApiError(
            500,
            err.message || "Internal Server Error"
        );
    }

    return res.status(err.statusCode).json({
        success: err.success,
        statusCode: err.statusCode,
        message: err.message,
        data: err.data || null,
        errors: err.errors,
        stack:
            process.env.NODE_ENV === "development"
                ? err.stack
                : undefined,
    });
};

export default errorHandler;
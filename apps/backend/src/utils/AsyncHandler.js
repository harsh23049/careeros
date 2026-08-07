//we know js has async behavior but it doesn't have a built-in way to handle errors in async functions. This is where 
// asyncHandler comes in. It wraps an async function and automatically catches any errors that occur, passing them to the 
// next middleware (usually an error handler). This helps to keep your code clean and avoids repetitive try-catch blocks.

const asyncHandler = (requestHandler) => {

    return (req, res, next) => {

        Promise
            .resolve(requestHandler(req, res, next))
            .catch((error) => next(error));

    };

};

export default asyncHandler;

//this function is same as above but using async/await syntax

// const asyncHandler = (requestHandler) => {
//     return async (req, res, next) => {
//         try {
//             await requestHandler(req, res, next);
//         } catch (error) {
//             next(error);
//         }
//     };
// };
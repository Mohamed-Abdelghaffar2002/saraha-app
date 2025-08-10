export const asyncHandler = (fn) => {
  return async (req, res, next) => {
    await fn(req, res, next).catch((error) => {
      // error.cause = 500; 
      return next(error);
    });
  };
};

export const successResponse = ({
  res,
  message = "Done",
  status = 200,
  data = {},
} = {}) => {
  res.status(status).json({ message, data });
};

export const globalErrorHandler = (error, req, res, next) => {
  res.status(error.cause || 500).json({ message: error.message });
};

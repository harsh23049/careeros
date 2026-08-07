function respondSuccess(res, data, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data });
}

function respondError(res, message, statusCode = 400) {
  return res.status(statusCode).json({ success: false, message });
}

module.exports = {
  respondSuccess,
  respondError,
};

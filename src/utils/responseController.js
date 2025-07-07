export function success(res, message, data = null, code = 200) {
  return res.status(code).json({ status: "success", code, message, data });
}

export function fail(res, message, code = 400) {
  return res.status(code).json({ status: "fail", code, message });
}

export function error(res, code = 500, errMsg = "Internal Server Error") {
  const message = process.env.NODE_ENV === "production" ? "Internal Server Error" : errMsg;
  return res.status(code).json({ status: "error", code, message });
}

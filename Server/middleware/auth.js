const jwt = require('jsonwebtoken');

/**
 * Middleware: Validate Token
 * Ensures valid JWT is provided in the Authorisation header
 * Populates req.tokenEmail on success; returns 401 error on failure
 */
const validateToken = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({
      error: true,
      message: "Authorization header ('Bearer token') not found"
    });
  }

  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.tokenEmail = decoded.email;
    next();
  } catch (e) {
    const message = e.name === "TokenExpiredError"
      ? "JWT token has expired"
      : "Invalid JWT token";

    res.status(401).json({
      error: true,
      message
    });
  }
};

/**
 * Middleware: Extract Token
 * Decodes JWT if present but does not enforce authentication
 * Populates req.tokenEmail if valid, else sets it to null
 */
const extractToken = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    req.tokenEmail = null;
    return next();
  }

  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.tokenEmail = decoded.email;
  } catch (e) {
    req.tokenEmail = null;
  }

  next();
};

module.exports = {
  validateToken,
  extractToken
};

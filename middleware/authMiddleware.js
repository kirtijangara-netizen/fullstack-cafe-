const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.SECRET_KEY || "mysecretkey";

const authMiddleware = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
  } catch (err) {
    res.clearCookie("token");
    req.user = null;
  }

  next();
};

module.exports = authMiddleware;
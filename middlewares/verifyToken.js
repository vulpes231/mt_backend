const { SignJWT, jwtVerify } = require("jose");
require("dotenv").config();

const generateUserToken = async (username, userId, type) => {
  const secret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);
  const expTime = type === "access" ? "1h" : "1d";

  const token = await new SignJWT({ username, userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expTime)
    .sign(secret);

  return token;
};

const generateAdminToken = async (username, userId, role, type = "access") => {
  const secret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);
  const expTime = type === "access" ? "1h" : "1d";

  const token = await new SignJWT({ username, userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expTime)
    .sign(secret);

  return token;
};

const verifyToken = (requiredRole = null) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers["authorization"];

      if (!authHeader) {
        return res.status(401).json({ message: "You're not logged in!" });
      }

      const token = authHeader.split(" ")[1];
      const secret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);
      const { payload } = await jwtVerify(token, secret);

      req.username = payload.username;
      req.userId = payload.userId;

      if (payload.role) {
        req.role = payload.role;
      }

      if (requiredRole && payload.role !== requiredRole) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      next();
    } catch (err) {
      if (err.code === "ERR_JWT_EXPIRED") {
        return res
          .status(403)
          .json({ message: "Session expired. Please login again" });
      }
      return res
        .status(403)
        .json({ message: "Invalid token. Please login again" });
    }
  };
};

module.exports = { verifyToken, generateUserToken, generateAdminToken };

// Usage
// const verifyJwt = verifyToken(); // No role required
// const verifyAdmin = verifyToken("admin"); // Admin role required

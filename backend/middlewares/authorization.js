const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../assets/data/constant");

const authMiddleware = (req, res, next) => {
  const authHeader = req.header.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ message: "Token not valid" });
  }

  try {
    const token = authHeader.split(" ")[1];

    const verifyToken = jwt.verify(token, JWT_SECRET);

    if (verifyToken.userId) {
      req.userId = verifyToken.userId;
      next();
    } else {
      return res.status(403).json({ message: "Token not valid" });
    }
  } catch (error) {
    console.log(error.message, "Error while verifying token");
    return res
      .status(500)
      .json({ message: "Server error while verifying token!" });
  }
};

module.exports = { authMiddleware };

const jwt = require("jsonwebtoken");

const decodeToken = (token) => {
    const jwtSecret = process.env.JWT_SECRET;
    const userId = jwt.verify(token, jwtSecret);
    return userId
}

module.exports = decodeToken


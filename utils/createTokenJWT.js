const createTokenJWT = (userId) => {
    const jwtSecret = process.env.JWT_SECRET;
    const jwt = require('jsonwebtoken');
    console.log("Criando o token, foi usado esse userID: ", userId)
    return jwt.sign({ userId }, jwtSecret, { expiresIn: '12h' });
}

module.exports = createTokenJWT
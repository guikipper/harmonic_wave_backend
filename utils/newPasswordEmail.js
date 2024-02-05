const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const htmlCode = (link) => `<!DOCTYPE html>
<html>
<head>
    <div>
    <p>Clique no link para alterar sua senha.</p>
    <a href="${link}" class="button">Recuperar senha</a>
    </div>
</body>
</html>`;

async function newPasswordEmail(email, userId) {
  try {
    const jwtPasswordSecret = process.env.JWT_SECRET_PASSWORD_CHANGE;
    const systemMail = process.env.EMAIL_USER; //email do sistema, usado para enviar o email
    const emailPassword = process.env.EMAIL_PASSWORD;

    const generateToken = (userId) => {
      return jwt.sign({ userId }, jwtPasswordSecret, { expiresIn: "10min" });
    };

    const token = generateToken(userId);

    console.log("O TOKEN GERADO: ", token);

    const url =
      "https://laughing-rotary-phone-4gq7vvgqx9p35jvp-3000.app.github.dev";
    const link = `${url}/recoverPassword?token=${token}`;

    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: systemMail,
        pass: emailPassword,
      },
      tls: {
        rejectUnauthorized: false, // Desativa a verificação do certificado
      },
    });
    const sendedEmail = await transport.sendMail({
      from: "Learn Music <techlowgray@gmail.com>",
      to: email,
      subject: "Pedido de recuperação de senha",
      html: htmlCode(link),
      text: "Deu certo!!!! Boa",
    });

    return sendedEmail;
  } catch (error) {
    return error
  }
}

module.exports = newPasswordEmail;

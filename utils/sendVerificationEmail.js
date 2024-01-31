const nodemailer = require('nodemailer')

const htmlCode = (validationLink) => `<!DOCTYPE html>
<html>
<head>
    <style>
        .email-container {
            background-color: #f4f4f4;
            padding: 20px;
            font-family: Arial, sans-serif;
        }
        .email-content {
            background-color: #ffffff;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
        }
        .header {
            font-size: 24px;
            color: #333333;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            color: #555555;
            margin-bottom: 30px;
        }
        .button {
            display: inline-block;
            background-color: #4CAF50;
            color: white; 
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 4px;
            font-size: 18px;
        }
        .button:hover {
            background-color: #45a049;
        }
        .footer {
            font-size: 12px;
            color: #777777;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-content">
            <div class="header">Bem-vindo ao LearnMusic</div>
            <div class="message">
                Estamos felizes em tê-lo conosco! Por favor, valide seu e-mail para começar a usar nosso serviço.
            </div>
            <a href="${validationLink}" class="button">Validar E-mail</a>
            <div class="footer">
                Se você não se cadastrou no LearnMusic, por favor ignore este e-mail.
            </div>
        </div>
    </div>
</body>
</html>`

const sendEmailVerification = (email, userId) => {
    const jwtSecret = process.env.JWT_SECRET;
    const systemMail = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;
    
    const jwt = require('jsonwebtoken');
    
    const generateToken = (userId) => {
        return jwt.sign({ userId }, jwtSecret, { expiresIn: '1h' });
    };
    
    const token = generateToken(userId);
    
    const url = "https://laughing-rotary-phone-4gq7vvgqx9p35jvp-3000.app.github.dev"
    const validationLink = `${url}/validate?token=${token}`;

    const transport = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: systemMail,
            pass: emailPassword
        },
        tls: {
            rejectUnauthorized: false  // Desativa a verificação do certificado
        }
    })
    
    transport.sendMail({
        from: 'Learn Music <techlowgray@gmail.com>',
        to: email,
        subject: 'Bem-vindo ao LearnMusic - Valide seu e-mail',
        html: htmlCode(validationLink),
        text: 'Deu certo!!!! Boa'
    })
    .then((response) => {
        console.log("Email enviado com sucesso!")
    })
    .catch((err) => {
        console.log("Deu erro: ", err)
    })
}

module.exports = sendEmailVerification
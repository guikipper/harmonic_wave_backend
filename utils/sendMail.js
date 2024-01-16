const nodemailer = require('nodemailer')

const sendEmailVerification = (email, userId) => {
    const jwt = require('jsonwebtoken');
    
    const generateToken = (userId) => {
        return jwt.sign({ userId }, 'segredinho', { expiresIn: '1h' });
    };
    
    const token = generateToken(userId);
    
    const url = "https://expert-fortnight-vgpvrrggvg6c6q94-3000.app.github.dev"
    const validationLink = `${url}/validate?token=${token}`;

    const transport = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'techlowgray@gmail.com',
            pass: 'ntgb uqsh jojp bnmt'
        },
        tls: {
            rejectUnauthorized: false  // Desativa a verificação do certificado
        }
    })
    
    transport.sendMail({
        from: 'Learn Music <techlowgray@gmail.com>',
        to: email,
        subject: 'Bem-vindo ao LearnMusic - Valide seu e-mail',
        html: `Clique no seguinte link para validar seu e-mail: <a href="${validationLink}">${validationLink}</a>`,
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
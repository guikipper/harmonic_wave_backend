const { MongoClient, ObjectId } = require('mongodb');
const getCollection = require('../db/connect')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmailVerification = require('../utils/sendMail');
const getUser = require('../utils/getUser')

class DataController {

    async validateEmail(email, userId) {
        sendEmailVerification(email, userId)
    }

    async insertId(id) {
        const collection = await getCollection('Users', 'LearnMusicDatabase')
    }

    async createUser (req, res) { 
        const userId = new ObjectId();
        try {
            const { name, email } = req.body; //nome e email
            const hashedPassword = await bcrypt.hash(req.body.password, 10) //senha

            const emailExists = await this.emailExists(email); //verifica se o email existe

            const user = { //preenche dados de usuário
            _id: userId,
            name, 
            email, 
            password: hashedPassword,
            emailVerified: false,
        }

            if (emailExists) {
                return res.status(400).json({ error: 'E-mail já cadastrado' });
            } else {
                this.insertUser(user, res)
                this.validateEmail(email, userId)
            }
        } catch(error) {
            console.error('Erro ao salvar usuário:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    
    async insertUser(user, res) {
        try {
            const collection = await getCollection('Users', 'LearnMusicDatabase') //local do banco que vai ser salvo
        
            const result = await collection.insertOne(user) //inserção no banco
            console.log('Usuário salvo:', result); // Exiba o usuário salvo no console
    
            return res.status(201).json({ statusCode: 201, message: 'Usuário salvo com sucesso', user: result });
        } catch(err) {
            console.error('Erro ao salvar inserir usuário:', err);
        }
       
    }

    async emailExists(email) {
        const collection = await getCollection('Users', 'LearnMusicDatabase');
        const existingUser = await collection.findOne({ email });
        return !!existingUser;
    }

    async validateLink(req, res) {
        const token = req.params.token

        if(!token) {
            return res.status(400).send('Token ausente na solicitação');
        }
        try {
            const decoded = await jwt.verify(token, 'segredinho');
            const userId = decoded.userId;
            const user = await getUser(userId)
    
            if (user.length === 0) {
                return res.status(404).send('Usuário não encontrado');
            }
    
            const collection = await getCollection('Users', 'LearnMusicDatabase');
    
            await collection.updateOne(
                { _id: new ObjectId(userId) },
                { $set: { emailVerified: true } }
            );

            return res.status(200).send('Email verificado com sucesso');
        } catch (error) {
            console.error(error);
            return res.status(500).send('Erro interno do servidor');
        }
      
    }

    async login(req, res) {
        const { email, password } = req.body
       
        const collection = await getCollection('Users', 'LearnMusicDatabase');
        const existingUser = await collection.findOne({ email });

        if (existingUser) {
            console.log(existingUser)
            if (existingUser.emailVerified === true) {
                const isMatch = await bcrypt.compare(req.body.password, existingUser.password);
            
            if (isMatch) {
                return res.status(201).json(
                    { 
                    statusCode: 201, 
                    message: 'Usuário autenticado!',
                    userId: existingUser._id,
                    email: email, 
                    username: existingUser.name, 
                });
            } else {
                return res.status(201).json(
                    { 
                    statusCode: 206, 
                    message: 'Email e/ou senha incorretos!',
                });
            }
            } else {
                return res.status(201).json(
                    { 
                    statusCode: 204, 
                    message: 'Endereço de Email não verificado!',
                });
            }
            
        } else {
            return res.json(
                {statusCode: 205,
                message: 'Usuário não cadastrado!'}
            )
        }
    }

   

}

module.exports = new DataController();
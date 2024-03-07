const { MongoClient, ObjectId } = require("mongodb");
const getCollection = require("../db/connect");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sendEmailVerification = require("../utils/sendVerificationEmail");
const getUser = require("../utils/getUser");
const verifyPassword = require("../utils/verifyPassword")
const decodeToken = require("../utils/decodeTokenJWT")
const getUserByEmail = require('../utils/getUserByEmail')
const createTokenJWT = require('../utils/createTokenJWT')
const encryptPassword = require('../utils/encryptPassword')
const newPasswordEmail = require('../utils/newPasswordEmail')
const decodeTokenRecoverPassword = require('../utils/decodeTokenRecoverPassword')

class DataController {
  
  async validateEmail(email, userId) {
    sendEmailVerification(email, userId);
  }

  async createUser(req, res) {

    const userId = new ObjectId();
    try {
      const { name, email, password } = req.body;
      const hashedPassword = await encryptPassword(password);

      const emailExists = await this.emailExists(email); 

      if (emailExists) {
        return res.status(400).json({ error: "E-mail já cadastrado" });
      } else {
        const user = {
          _id: userId,
          name,
          email,
          password: hashedPassword,
          emailVerified: false,
        };
        this.insertUser(user, res);
        this.validateEmail(email, userId);
      }
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  async insertUser(user, res) {
    try {
      const collection = await getCollection("Users", "LearnMusicDatabase"); 

      const result = await collection.insertOne(user);
      console.log("Usuário salvo:", result);

      return res
        .status(201)
        .json({
          statusCode: 201,
          message: "Usuário salvo com sucesso",
          user: result,
        });
    } catch (err) {
      console.error("Erro ao salvar inserir usuário:", err);
    }
  }

  async emailExists(email) {
    const existingUser = await getUserByEmail(email)
    return !!existingUser;
  }

  async validateLink(req, res) {
    const token = req.params.token;

    if (!token) {
      return res.status(400).send("Token ausente na solicitação");
    }
    try {
      const decodedToken = decodeToken(token)
      
      const userId = decodedToken.userId;
      const user = await getUser(userId);

      if (user.length === 0) {
        return res.status(404).send("Usuário não encontrado");
      }

      const collection = await getCollection("Users", "LearnMusicDatabase");

      await collection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { emailVerified: true } }
      );

      return res.status(200).send("Email verificado com sucesso");
    } catch (error) {
      console.error(error);
      return res.status(500).send("Erro interno do servidor");
    }
  }

  async authenticate(req, res) {
    try {
      const { token } = req.body
      
      const decoded = decodeToken(token)
      const userId = decoded.userId

      const existingUser = await getUser(userId)

      if (!userId) {
        return res.status(402).send("userId não encontrado")
      }

      const userData = {
        name: existingUser.name,
        email: existingUser.email
      }

      return res.status(201).json({
          statusCode: 201,
          message: "Usuário autenticado sucesso",
          userData: userData
        });

    } catch (error) {
      console.error('Erro ao processar a requisição:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  async login(req, res) {
    try {

      console.log("Em login no servidor")
      const { email, password } = req.body;
      console.log(email, password)
  
      const existingUser = await getUserByEmail(email)
      console.log('existingUser? ',existingUser)

      if (!existingUser) {
        return res.status(404).json({ statusCode: 205, message: "Usuário não cadastrado!" });
      }
      
      if (!existingUser.emailVerified) {
        return res.status(401).json({
            statusCode: 204,
            message: "Endereço de Email não verificado!",
        });
      }
      
      const isMatch = await verifyPassword(password, existingUser.password)

      if (!isMatch) {
          return res.status(401).json({
              statusCode: 206,
              message: "Email e/ou senha incorretos!",
          });
      }
  
      const jwtToken = createTokenJWT(existingUser._id.toString())
  
      if(!jwtToken) {
        console.log("Problema da geração do Token")
      }
  
      return res.status(200).json({
          statusCode: 201,
          message: "Usuário autenticado!",
          token: jwtToken, // O token JWT gerado
      });
    } catch (error) {
      console.error('Erro ao processar a requisição:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
   
  }

  async changeName(req, res) {
    const collection = await getCollection("Users", "LearnMusicDatabase");
    const { newName, oldName } = req.body
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7, authHeader.length);
      const decodedToken = decodeToken(token)   
      const userId = decodedToken.userId;

      const filter = { _id: new ObjectId(userId) };
      const update = {
        $set: {
          name: newName,
          oldName: oldName,
        },
      };

    const result = await collection.findOneAndUpdate(filter, update, {
      returnDocument: "after",
      upsert: false, // Não criar um novo documento se nenhum for encontrado
    });

    if (!result) {
      return res.status(501).json({
        message: "Erro ao alterar o nome do usuário!",
      });
    }

    const userDataResponse = {
      name: result.name,
    };

    return res.status(201).json({
      statusCode: 201,
      message: "Nome alterado com sucesso!",
      newName: userDataResponse.name,
    });
    }

    
  }

  async changePassword(req, res) {
    
    const collection = await getCollection("Users", "LearnMusicDatabase");
    const { password, newPassword } = req.body;
    const authHeader = req.headers.authorization; 
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7, authHeader.length);
      const decodedToken = decodeToken(token)   
      const userId = decodedToken.userId;
      console.log("O userId em changePassword: ", userId)

      const user = await collection.findOne({ _id: new ObjectId(userId) });
      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch) {

        const hashedNewPassword = await encryptPassword(newPassword)
        console.log("A nova senha codificada: ", hashedNewPassword)
        const filter = { _id: new ObjectId(userId) };
        const update = {
          $set: {
            password: hashedNewPassword,
          },
        };
  
        const result = await collection.findOneAndUpdate(filter, update, {
          returnDocument: "after",
          upsert: false,
        });
  
        if (!result) {
          return res.status(501).json({
            message: "Erro ao alterar a senha do usuário!",
          });
        }

        console.log("Senha alterada com sucesso!")

        return res.status(201).json({
          statusCode: 201,
          message: "Senha alterada com sucesso!",
        });
  
      } else {
          return res.status(201).json({
              statusCode: 202,
              message: "Senha atual inválida!",
            });
      }
    }

  }

  async deleteAccount(req, res) {

    try {
     const collection = await getCollection("Users", "LearnMusicDatabase"); 
     const { password } = req.body
     
     const authHeader = req.headers.authorization;
     const token = authHeader.substring(7, authHeader.length);
     const decodedToken = decodeToken(token)   
     const userId = decodedToken.userId;
     
     const user = await collection.findOne({ _id: new ObjectId(userId) });

     console.log("Usuário existe: ", user)

     if(!user) {
       return res.status(401).json({
         statusCode: 201,
         message: "Usuário não encontrado!"
       })
     }

     const isMatch = await bcrypt.compare(password, user.password);
    
     if (isMatch) {

       const result = await collection.deleteOne({ _id: new ObjectId(userId) })
       console.log(`DELETADO: ${result.deletedCount} documento(s) deletado(s)`);
       
       return res.status(201).json({
         statusCode: 201,
         message: "Usuário deletado com sucesso!"
       })

     } else {

       console.log("Senha inválida!")
       return res.status(401).json({
         message: "Senha inválida!",
       });
     }

     } catch (error) {
       console.log("Error: ", error)
     } 
    
  }

  async sendPasswordRecovery(req, res) {
    try {
      const { email } = req.body
      const existingUser = await getUserByEmail(email)

      if(!existingUser) {
        console.log("Usuário não existe!")
          return res.status(404).json({
            message: "Email não encontrado na base de dados!",
        });
      }

      const userId = existingUser._id.toString()
      const result = await newPasswordEmail(email, userId)

      return res.status(201).json({
        message: "Email enviado com sucesso!",
      });

    } catch (error) {
      return res.status(500).json({
        message: "Erro: ", error,
      });
    }
  }

  async testeGet(req, res) {
    res.send('Route is working!!!')
  }

  async recoverPassword(req, res) {
    
    const authHeader = req.headers.authorization;
    const token = authHeader.substring(7, authHeader.length);
    const decodedToken = decodeTokenRecoverPassword(token) 
    const newPassword = req.body.newPassword

    if (decodedToken.error == "Token has expired.") {
    return res.status(401).json({
      message: "Erro: Token expirado.",
    });
    }
    if (decodedToken.error == "Invalid token.") {
      return res.status(401).json({
        message: "Erro: Token inválido.",
      });
    }
    if (decodedToken.error == "Failed to authenticate token.") {
      return res.status(401).json({
        message: "Erro: Falha ao autenticar o token.",
      });
    }
     
    const userId = decodedToken.userId;

    const existingUser = await getUser(userId)

      if (!existingUser) {
        return res.status(401).json({
          message: "Usuário não encontrado!",
        });
      }

      const isMatch = await bcrypt.compare(newPassword, existingUser.password);

      if (isMatch) {
        return res.status(401).json({
          message: "Por segurança, escolha uma senha diferente da atual.",
        });
      }
      const collection = await getCollection("Users", "LearnMusicDatabase"); 
      const hashedNewPassword = await encryptPassword(newPassword)
      const filter = { _id: new ObjectId(userId) };
      const update = {
        $set: {
          password: hashedNewPassword,
        },
      };

    const result = await collection.findOneAndUpdate(filter, update, {
      returnDocument: "after",
      upsert: false, // Não criar um novo documento se nenhum for encontrado
    });

    console.log("Senha alterada com sucesso!")
    return res.status(201).json({
      message: "Senha alterada com sucesso!",
    });

  }

}

module.exports = new DataController();

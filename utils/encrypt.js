const bcrypt = require('bcryptjs');

async function encryptPassword(senha) {
    const saltRounds = 10; // Número de rounds para o algoritmo de hashing
  
    try {
      const hash = await bcrypt.hash(senha, saltRounds);
      return hash;
    } catch (error) {
      throw new Error('Erro ao criar o hash de senha');
    }
  }
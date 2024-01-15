const getCollection = require('../db/connect')
const { ObjectId } = require('mongodb');
const getUser = async ( userId ) => {
        try {
            const collection = await getCollection('Users', 'LearnMusicDatabase');
            const result = await collection.find({ _id: new ObjectId(userId) }).toArray();
            return result;
        } catch (error) {
            console.error("Erro ao obter usuários:", error);
            return error;
        }
}

module.exports = getUser
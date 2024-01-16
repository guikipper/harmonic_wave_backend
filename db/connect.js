const { MongoClient } = require('mongodb')
const password = "83HVokSxLwnuVfbi"

const uri = `mongodb+srv://guikipper1:${password}@learnmusicdatabase.iiz7uzy.mongodb.net/`

const client = new MongoClient(uri)
console.log(client)

async function run(col, database) {
    try {
        console.log("Tentando conectar ao banco")
        await client.connect()
        const db = client.db(database)
        const collection = db.collection(col)
        return collection
    } catch (error) {
        console.log('Erro: ',error)
    }
}

module.exports = run

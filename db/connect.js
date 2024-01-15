const { MongoClient } = require('mongodb')
const password = "83HVokSxLwnuVfbi"

const uri = `mongodb+srv://guikipper1:${password}@learnmusicdatabase.iiz7uzy.mongodb.net/`

const client = new MongoClient(uri)

async function run(col, database) {
    try {
        await client.connect()
        const db = client.db(database)
        const collection = db.collection(col)
        return collection
    } catch (error) {
        console.log('Erro: ',error)
    }
}

module.exports = run

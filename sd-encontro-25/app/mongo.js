const { MongoClient } = require('mongodb')

const uri =
  'mongodb://mongo1:27017,mongo2:27017,mongo3:27017/?replicaSet=rs0'

const client = new MongoClient(uri)

async function connect() {
  if (!client.topology?.isConnected()) {
    await client.connect()
  }

  return client.db('caplab')
}

module.exports = connect

const router = require('express').Router()
const connect = require('../mongo')

router.post('/write', async (req, res) => {
  try {
    const db = await connect()

    const result = await db.collection('accounts').insertOne(
      {
        name: req.body.name,
        balance: req.body.balance,
        createdAt: new Date()
      },
      {
        writeConcern: {
          w: 'majority'
        }
      }
    )

    res.send(result)
  } catch (err) {
    res.status(500).send({
      error: err.message
    })
  }
})

router.get('/read/:name', async (req, res) => {
  try {
    const db = await connect()

    const result = await db.collection('accounts').findOne(
      {
        name: req.params.name
      },
      {
        readConcern: {
          level: 'majority'
        }
      }
    )

    res.send(result)
  } catch (err) {
    res.status(500).send({
      error: err.message
    })
  }
})

module.exports = router

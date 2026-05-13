const router = require('express').Router()
const connect = require('../mongo')

router.post('/write', async (req, res) => {
  try {
    const db = await connect()

    const result = await db.collection('products').insertOne(
      {
        name: req.body.name,
        stock: req.body.stock,
        createdAt: new Date()
      },
      {
        writeConcern: {
          w: 1
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

    const result = await db.collection('products').findOne(
      {
        name: req.params.name
      },
      {
        readPreference: 'secondaryPreferred'
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

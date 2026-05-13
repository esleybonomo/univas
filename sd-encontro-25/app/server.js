const express = require('express')

const strong = require('./routes/strong')
const eventual = require('./routes/eventual')

const app = express()

app.use(express.json())

app.use('/strong', strong)
app.use('/eventual', eventual)

app.get('/', (_, res) => {
  res.send({
    message: 'CAP Theorem Lab Running'
  })
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
})

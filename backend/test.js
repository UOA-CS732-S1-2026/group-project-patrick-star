require('dotenv').config()
const mongoose = require('mongoose')
const { addItem, getItems } = require('./db/clothingService')

async function run() {
  await mongoose.connect(process.env.MONGO_URI)

  await addItem({
    userId: '000000000000000000000000',
    name: 'Tshirt',
    category: 'upper_body',
    size: 'M',
    colour: 'black',
    fit: 'regular',
    imageUrls: {}
  })

  const items = await getItems('000000000000000000000000')
  console.log(items)

  await mongoose.disconnect()
}

run()
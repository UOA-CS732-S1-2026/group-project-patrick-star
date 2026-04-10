require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const { addItem, getItems, updateItem, deleteItem } = require('./db/clothingService')

const app = express()
app.use(express.json())

mongoose.connect(process.env.MONGO_URI)

app.post('/items', async (req, res) => {
  res.json(await addItem(req.body))
})

app.get('/items/:userId', async (req, res) => {
  res.json(await getItems(req.params.userId))
})

app.put('/items/:id', async (req, res) => {
  res.json(await updateItem(req.params.id, req.body))
})

app.delete('/items/:id', async (req, res) => {
  res.json(await deleteItem(req.params.id))
})

app.listen(3000)
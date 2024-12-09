import express from 'express'
import userRouter from './routes/users.routers'
import databseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.midlewares'
import mediaRouter from './routes/medias.routers'
import { initFolder } from './utils/file'
import staticRouter from './routes/static.routers'
import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'
dotenv.config()

// //test mongo
// const demoClient = new MongoClient(
//   `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@shoppingcardprojectclus.nyxnp.mongodb.net/?retryWrites=true&w=majority&appName=shoppingCardProjectCluster`
// )
// const db_earth = demoClient.db('earth')
// const users = db_earth.collection('users')
// //tao ra 1000 users gia
// function getRandomAge() {
//   return Math.floor(Math.random() * 100) + 1
// }
// const userData = []
// for (let i = 0; i < 1000; i++) {
//   userData.push({
//     name: `Users ${i}`,
//     age: getRandomAge(),
//     sex: i % 2 == 0 ? 'male' : 'female'
//   })
// }
// users.insertMany(userData)

//---------------------------------
const app = express()
const PORT = process.env.PORT || 3000
databseService.connect() //conect voi servedatabase
initFolder()

app.use(express.json()) //server dung middleware bien doi cac chuoi json dc gui len thanh object
//app dung router
app.use('/users', userRouter)
app.use('/medias', mediaRouter)
app.use('/static', staticRouter)
// app.get('/', (req, res) => {
//   console.log(`HELLO WORLD`)
//   res.send('Hello')
// })
app.use(defaultErrorHandler)
//http://localhost:3000/users/login
app.listen(PORT, () => {
  console.log('SERVER BE dang mo o port' + PORT)
})

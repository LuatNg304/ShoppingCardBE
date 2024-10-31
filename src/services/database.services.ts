import { Collection, Db, MongoClient } from 'mongodb'
//
import dotenv from 'dotenv'
import User from '~/models/schemas/User.schema'
dotenv.config() //ket noi voi file .env
//can thoat ra tai trong terminal: npm i dotenv
const url = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@shoppingcardprojectclus.nyxnp.mongodb.net/?retryWrites=true&w=majority&appName=shoppingCardProjectCluster`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
class DatabseService {
  //thong thuong neu co class thi nen export ban the cua no
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(url)
    this.db = this.client.db(process.env.DB_NAME)
  }

  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  //accessor property
  get users(): Collection<User> {
    //dinh nghia lai, nho co scheme nhan vao la user
    return this.db.collection(process.env.DB_USERS_COLLECTION as string)
  }
}

//tao ban the instance
const databseService = new DatabseService()
export default databseService

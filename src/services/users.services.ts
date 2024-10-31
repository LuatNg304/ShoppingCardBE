import { RegisterReqbody } from '~/models/requests/users.requests'
import databseService from './database.services'
import User from '~/models/schemas/User.schema'
import { hashPassword } from '~/utils/crypto'
import { sign } from 'crypto'
import { signToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enums'
import dotenv from 'dotenv'
import { access } from 'fs/promises'
dotenv.config()
class UsersServices {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken },
      //privateKey: khong can de vi minh setup ? bneh jwt
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN }
    })
  }
  private signResfeshToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.RefeshToken },
      //privateKey: khong can de vi minh setup ? bneh jwt
      options: { expiresIn: process.env.REFESH_TOKEN_EXPIRE_IN }
    })
  }

  async checkEmailExit(email: string) {
    //dung email len db tim user so huu email do, tiet kiem hon an toan hon
    const user = await databseService.users.findOne({ email })
    return Boolean(user)
    //neu len db de kiem user neu khong co nhan dc null, ma null la false
  }

  async register(payLoad: RegisterReqbody) {
    const result = await databseService.users.insertOne(
      new User({
        ...payLoad,
        password: hashPassword(payLoad.password), //ghi de
        date_of_birth: new Date(payLoad.date_of_birth) //ghi de' vi kieu dateofbirth khac nhau
      })
    )
    const user_id = result.insertedId.toString() //mongo tra ra id,khong dung dc as vi as chi dung khi phan van khong biet la loai gi
    //tao access va refesh
    const [access_token, refesh_token] = await Promise.all([
      this.signAccessToken(user_id),
      this.signResfeshToken(user_id)
    ]) //ca hai cung chay khong cho asynchorous

    return {
      access_token,
      refesh_token
    }
  }
}
//tao ra 1 instance
const usersServices = new UsersServices()
export default usersServices

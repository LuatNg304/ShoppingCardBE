import { loginReqBody, RegisterReqbody } from '~/models/requests/users.requests'
import databseService from './database.services'
import User from '~/models/schemas/User.schema'
import { hashPassword } from '~/utils/crypto'
import { sign } from 'crypto'
import { signToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enums'
import dotenv from 'dotenv'
import { access } from 'fs/promises'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { DatabaseSync } from 'node:sqlite'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
dotenv.config()
class UsersServices {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken },
      //privateKey: khong can de vi minh setup ? bneh jwt
      privateKey: process.env.JWT_SERECT_ACCESS_TOKEN as string,
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN }
    })
  }
  private signResfeshToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.RefeshToken },
      //privateKey: khong can de vi minh setup ? bneh jwt
      privateKey: process.env.JWT_SERECT_REFRESH_TOKEN as string,
      options: { expiresIn: process.env.REFESH_TOKEN_EXPIRE_IN }
    })
  }

  async checkEmailExit(email: string) {
    //dung email len db tim user so huu email do, tiet kiem hon an toan hon
    const user = await databseService.users.findOne({ email })
    return Boolean(user)
    //neu len db de kiem user neu khong co nhan dc null, ma null la false
  }
  async checkRefreshLogout({ user_id, refresh_token }: { user_id: string; refresh_token: string }) {
    const refreshtoken = await databseService.refresh_tokens.findOne({
      user_id: new ObjectId(user_id),
      token: refresh_token
    })
    if (!refreshtoken) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: USERS_MESSAGES.REFESH_TOKEN_INVALID
      })
    }
    return refreshtoken
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
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user_id),
      this.signResfeshToken(user_id)
    ])
    //luu cai refresh token lai
    await databseService.refresh_tokens.insertOne(
      new RefreshToken({
        token: refresh_token,
        user_id: new ObjectId(user_id)
      })
    )
    return {
      access_token,
      refresh_token
    }
  }
  async login({ email, password }: loginReqBody) {
    //dung email va user de tim string
    const user = await databseService.users.findOne({
      email,
      password: hashPassword(password)
    })
    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNPROCESSABLE_ENTITY, //422
        message: USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT
      })
    }
    //neu co thi tao ac va rf
    const user_id = user._id.toString()
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user_id),
      this.signResfeshToken(user_id)
    ])
    //luu cai refresh token lai
    await databseService.refresh_tokens.insertOne(
      new RefreshToken({
        token: refresh_token,
        user_id: new ObjectId(user_id)
      })
    )
    return {
      access_token,
      refresh_token
    }
  }
  async logout(refresh_token: string) {
    await databseService.refresh_tokens.deleteOne({ token: refresh_token })
    return {}
  }
}
//tao ra 1 instance
const usersServices = new UsersServices()
export default usersServices

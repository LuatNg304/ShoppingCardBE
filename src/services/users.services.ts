import { loginReqBody, RegisterReqbody } from '~/models/requests/users.requests'
import databseService from './database.services'
import User from '~/models/schemas/User.schema'
import { hashPassword } from '~/utils/crypto'
import { sign } from 'crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import dotenv from 'dotenv'
import { access } from 'fs/promises'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { DatabaseSync } from 'node:sqlite'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import { error } from 'console'
import { JsonWebTokenError } from 'jsonwebtoken'
import { update } from 'lodash'
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
      payload: { user_id, token_type: TokenType.RefreshToken },
      //privateKey: khong can de vi minh setup ? bneh jwt
      privateKey: process.env.JWT_SERECT_REFRESH_TOKEN as string,
      options: { expiresIn: process.env.REFESH_TOKEN_EXPIRE_IN }
    })
  }
  private signEmailToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.EmailVerifycationToken },
      //privateKey: khong can de vi minh setup ? bneh jwt
      privateKey: process.env.JWT_SERECT_EMAIL_VERIFY_TOKEN as string,
      options: { expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRED_IN }
    })
  }
  private signForgotPasswordTokenToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.ForgotPasswordToken },
      //privateKey: khong can de vi minh setup ? bneh jwt
      privateKey: process.env.JWT_SERECT_FORGOT_TOKEN as string,
      options: { expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN }
    })
  }
  async findUserbyEmail(email: string) {
    return await databseService.users.findOne({ email })
  }
  async checkEmailExit(email: string) {
    //dung email len db tim user so huu email do, tiet kiem hon an toan hon
    const user = await databseService.users.findOne({ email })
    return Boolean(user)
    //neu len db de kiem user neu khong co nhan dc null, ma null la false
  }
  async findUserById(user_id: string) {
    return await databseService.users.findOne({ _id: new ObjectId(user_id) })
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
  async checkEmailVerify({
    user_id,
    email_verify_token
  }: {
    user_id: string //
    email_verify_token: string
  }) {
    //tim user bang user_id va email_veridy_token
    const user = await databseService.users.findOne({
      _id: new ObjectId(user_id),
      email_verify_token
    })
    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND, //404
        message: USERS_MESSAGES.USER_NOT_FOUND
      })
    }
    return user
  }
  async register(payLoad: RegisterReqbody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailToken(user_id.toString())
    const result = await databseService.users.insertOne(
      new User({
        _id: user_id,
        email_verify_token,
        ...payLoad,
        password: hashPassword(payLoad.password), //ghi de
        date_of_birth: new Date(payLoad.date_of_birth) //ghi de' vi kieu dateofbirth khac nhau
      })
    )

    //tao access va refesh
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user_id.toString()),
      this.signResfeshToken(user_id.toString())
    ])
    //gui qua mail
    console.log(`Noi dung email xac thuc Email gom:
      http://localhost:3000/users/verify-email/?email_verify_token=${email_verify_token}  
    `)

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
  async verifyEmail(user_id: string) {
    //dung user_id tim va cap nhat
    await databseService.users.updateOne(
      { _id: new ObjectId(user_id) }, //
      [
        {
          $set: {
            verify: UserVerifyStatus.Verified,
            email_verify_token: '',
            updated_at: '$$NOW'
          }
        }
      ]
    )
    //tao ac va rf
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
  async resendEmialVerify(user_id: string) {
    const email_verify_token = await this.signEmailToken(user_id)
    //luu
    await databseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          email_verify_token,
          updated_at: '$$NOW'
        }
      }
    ])
    //gui qua mail
    console.log(`
      Noi dung email xac thuc Email gom:
        http://localhost:3000/users/verify-email/?email_verify_token=${email_verify_token}  
      `)
  }
  async forgotPassword(email: string) {
    const user = await databseService.users.findOne({ email })
    if (user) {
      const user_id = user._id
      const forgot_password_token = await this.signForgotPasswordTokenToken(user_id.toString())
      await databseService.users.updateOne({ _id: new ObjectId(user_id) }, [
        {
          $set: {
            forgot_password_token,
            update_at: '$$NOW'
          }
        }
      ])
      //gui mail
      console.log(`
        Bam vo day de doi mat khau
        http://localhost:8000/reset-password/?forgot-password=${forgot_password_token}  
      `)
    }
  }
}
//tao ra 1 instance
const usersServices = new UsersServices()
export default usersServices

//file nay luu ham dung de tao ra mot token
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import { TokenPayload } from '~/models/requests/users.requests'
dotenv.config()
//gam ky ten
export const signToken = ({
  //vua phan ra vua dinh nghia, ham can 1 obj co ba thuoc tinh va phan ra cac thuoc tinh do
  // ? dung de lam options co cung dc, kh cung dc
  payload,
  privateKey,
  options = { algorithm: 'HS256' }
}: {
  payload: string | Buffer | object
  privateKey: string
  options?: jwt.SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (error, token) => {
      if (error) throw reject(error)
      else return resolve(token as string)
    })
  })
}
//ham kiem tra chu ky neu dung thi tra ra payload
//payload la noi dung cat vao chu ky
export const verifyToken = ({
  token,
  privateKey //neu khong dua thi dung mac dinh
}: {
  token: string
  privateKey: string
}) => {
  return new Promise<TokenPayload>((resolve, reject) => {
    jwt.verify(token, privateKey, (error, decode) => {
      if (error) throw reject(error)
      else return resolve(decode as TokenPayload)
    })
  })
}

//file nay luu ham dung de tao ra mot token
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
dotenv.config()
export const signToken = ({
  //vua phan ra vua dinh nghia, ham can 1 obj co ba thuoc tinh va phan ra cac thuoc tinh do
  // ? dung de lam options co cung dc, kh cung dc
  payload,
  privateKey = process.env.JWT_SERECT as string,
  options = { algorithm: 'HS256' }
}: {
  payload: string | Buffer | object
  privateKey?: string
  options?: jwt.SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (error, token) => {
      if (error) throw reject(error)
      else return resolve(token as string)
    })
  })
}

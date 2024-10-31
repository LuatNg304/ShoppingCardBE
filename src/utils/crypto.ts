import { createHash } from 'crypto'
import dotenv from 'dotenv'

//tao ham content ma hoa thanh sha256
function sha256(content: string) {
  return createHash('sha256').update(content).digest('hex')
}

//tao ham
export function hashPassword(password: string) {
  return sha256(password + process.env.PASSWORD_SECRET)
}

import { JwtPayload } from 'jsonwebtoken'
import { TokenType } from '~/constants/enums'

//file nay luu cac dinh nghia cua cac request
export interface RegisterReqbody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
}

export interface loginReqBody {
  email: string
  password: string
}
export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
}

export interface LogoutReqBody {
  refresh_token: string
}

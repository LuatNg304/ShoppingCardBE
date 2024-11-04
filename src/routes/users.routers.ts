import express, { Request, Response } from 'express'

import { loginController, logoutController, registerController } from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from '~/middlewares/users.middlewares'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { wraptAsync } from '~/utils/handlers'
const userRouter = express.Router()
/*register
    Desc: Register a new user
    path:/register
    method: post
    body:{
        name: string,
        email: string,
        password: string,
        confirm_password: string,
        date_of_birth: string co cau truc la ISO8601

    }
*/
//throw khong the chay trong ham async, con next thi dung duoc o ham bth va ca hai
userRouter.post('/register', registerValidator, wraptAsync(registerController))

/*login
path: users/login
method: post
body:{
    email: string,
    passsword: string
}
*/
//handler
userRouter.post('/login', loginValidator, wraptAsync(loginController))
/*
desc: logout
path: users/logout
method: post
headers:{
    Authorizations: 'Bearer <access_token>'
}
body:{

}
*/
userRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wraptAsync(logoutController))
userRouter.post('/me')
userRouter.post('/update')
export default userRouter

import express, { Request, Response } from 'express'

import {
  forgotPasswordController,
  getMeController,
  loginController,
  logoutController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  updateMeController,
  verifyEmailTokenController,
  verifyForgotPasswordTokenController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  updateMeValidator
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
/*desc: logout
path: users/logout
method: post
headers:{
    Authorizations: 'Bearer <access_token>'
}
body:{

}
*/
userRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wraptAsync(logoutController))

/*verify email
 khi nguoi dun nhan vao link dc guitrong mail cua ho
 thi evt se duoc gui len database thong qua req.query
 path: users/verify-email/?email_verify_token=string
 method=get
*/
userRouter.get(
  '/verify-email/', //
  emailVerifyTokenValidator,
  wraptAsync(verifyEmailTokenController)
) //-----------------------------------------------------------------------ngon---------------------------------

/*resend email verify token
nguoi dung se dung chuc nang nay khi khi lam mat, lac email
phai dang nhap thi moi duoc verify
header{
    Authorrization: 'Bearer <access_token>
}
method: post
*/
userRouter.post(
  '/resend-verify-email',
  accessTokenValidator, //
  wraptAsync(resendVerifyEmailController)
) //-----------------------------------------------------------------ngon---------------------

/*Forgot password
khi quen mk thi dung chuc nang nay
path: users/forgot/password
method : post



*/
userRouter.post(
  '/forgot-password', //
  forgotPasswordValidator,
  wraptAsync(forgotPasswordController)
) //----------------------------------------------------------------ngon---------------

/*verify forgot password token
  kt  xem fpt co con hieu luc hay khong
  path: users/verify-forgot-passwork
  method: post
  body:{
    forgot_password_token: string
  }
 */
userRouter.post(
  '/veridy-forgot-password',
  forgotPasswordTokenValidator,
  wraptAsync(verifyForgotPasswordTokenController)
)

/*reset password
path: users/reset-password
method :post
bodyP{
password: string,
  confirm_password: string,
  forgot_password_token: string
}
 */
userRouter.post(
  '/reset-password', //

  forgotPasswordTokenValidator,
  resetPasswordValidator, //kt pass, cf pass, fpt
  wraptAsync(resetPasswordController)
) //xu ly logic

/*
des: get profile của user
path: '/me'
method: post
Header: {Authorization: Bearer <access_token>}
body: {}
*/
userRouter.post('/me', accessTokenValidator, wraptAsync(getMeController))
/*
des: update profile của user
path: '/me'
method: patch
Header: {Authorization: Bearer <access_token>}
body: {
  name?: string
  date_of_birth?: Date
  bio?: string // optional
  location?: string // optional
  website?: string // optional
  username?: string // optional
  avatar?: string // optional
  cover_photo?: string // optional}
*/
userRouter.patch('/me', accessTokenValidator, updateMeValidator, wraptAsync(updateMeController))
userRouter.post('/update')

export default userRouter

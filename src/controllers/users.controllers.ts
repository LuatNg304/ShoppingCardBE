import { NextFunction, Request, Response } from 'express'
import {
  loginReqBody,
  LogoutReqBody,
  RegisterReqbody,
  ResetPasswordReqBody,
  TokenPayload,
  UpdateMeReqBody,
  verifyEmailReqQuery,
  VerifyForgotPasswordTokenReqBody
} from '~/models/requests/users.requests'
import User from '~/models/schemas/User.schema'
import usersServices from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { result } from 'lodash'
import { USERS_MESSAGES } from '~/constants/messages'
import { UserVerifyStatus } from '~/constants/enums'
import { userInfo } from 'os'
//controller la hnadle co nv tap ket du lieu nguou dung
//va phan phat vao cac server dung cho

//controller la noi tap ket va xu ly logiccho cac du lieu nhan duoc
//trong controller cac du lieu deu pjai clean

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqbody>,
  res: Response,
  next: NextFunction
) => {
  //**quan trong dinh nghia lai req bang trong file model, va dinh gnhai lai req<>, cach import ParamsDictionary, theo cach ctrl va nhan chuot trai
  // vao ParamsDictionary tim vao file cua no roi copy
  const { email } = req.body
  //service va luu vao database
  //luu user do vao users collection cua mongoDB

  //kt email co bi trung hay chua, co ton tai chua, co ai dung chua
  const isDup = await usersServices.checkEmailExit(email)
  if (isDup) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.UNPROCESSABLE_ENTITY, //422
      message: USERS_MESSAGES.EMAIL_ALREADY_EXISTS
    })
  }
  const result = await usersServices.register(req.body)
  res.status(HTTP_STATUS.CREATED).json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result: result
  })
}
export const loginController = async (
  req: Request<ParamsDictionary, any, loginReqBody>,
  res: Response,
  next: NextFunction
) => {
  //throw Error('Ahihi') test loi ham defaultErrorHandler
  //can lay email va password de tim xem user nao dang so huu
  //neu khong co thi user nao dung cuoc choi
  //neu co thi tao at va rf
  const { email, password } = req.body
  const result = await usersServices.login({ email, password })
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result
  })
}
export const logoutController = async (
  req: Request<ParamsDictionary, any, LogoutReqBody>,
  res: Response,
  next: NextFunction
) => {
  //xem thu user_id trong payload refresh_tiken va access_token
  const { refresh_token } = req.body
  const { user_id: user_id_ac } = req.decode_authorization as TokenPayload
  const { user_id: user_id_rf } = req.decode_refresh_token as TokenPayload
  if (user_id_ac != user_id_rf) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.UNAUTHORIZED,
      message: USERS_MESSAGES.REFESH_TOKEN_INVALID
    })
  }
  //neu mo gui len thi cai nay co duoc luu hay khong
  await usersServices.checkRefreshLogout({
    user_id: user_id_ac,
    refresh_token
  })
  //khi nao co ma do trong database thi ta tine hanh logout
  await usersServices.logout(refresh_token)
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.LOGIN_SUCCESS
  })
}

export const verifyEmailTokenController = async (
  req: Request<ParamsDictionary, any, any, verifyEmailReqQuery>,
  res: Response,
  next: NextFunction
) => {
  const { email_verify_token } = req.query
  const { user_id } = req.decode_email_verify_token as TokenPayload

  //khi ho bma vao link ho se gui email verify len thong req.query
  //kiem tra xem trong database co user nao so huu user_id trong payload va email_verify_token hay khong
  const user = await usersServices.checkEmailVerify({ user_id, email_verify_token })
  //kiem tra xem user tim duoc banned chua, chua thi moi verify
  if (user.verify == UserVerifyStatus.Banned) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.UNAUTHORIZED,
      message: USERS_MESSAGES.EMAIL_HAS_BEEN_BANNED
    })
  } else {
    //chua verify thi minh verify
    const result = await usersServices.verifyEmail(user_id)
    res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.EMAIL_HAS_BEEN_VERIFIED,
      result
    })

    //sau khi verify thi
  }
}
export const resendVerifyEmailController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  //dung user_id tim user do
  const { user_id } = req.decode_authorization as TokenPayload
  //kt user do co bi banned khong neu khong thi moi resendEmailVerify
  const user = await usersServices.findUserById(user_id)
  if (!user) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.NOT_FOUND,
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }
  if (user.verify == UserVerifyStatus.Verified) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.OK,
      message: USERS_MESSAGES.EMAIL_HAS_BEEN_VERIFIED
    })
  } else if (user.verify == UserVerifyStatus.Banned) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.OK,
      message: USERS_MESSAGES.EMAIL_HAS_BEEN_BANNED
    })
  } else {
    await usersServices.resendEmialVerify(user_id)
    res.status(HTTP_STATUS.OK).json({
      messageL: USERS_MESSAGES.RESEND_EMAIL_VERIFY_TOKEN_SUCCESS
    })
  }
}
export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body
  const hasUser = await usersServices.checkEmailExit(email)
  if (!hasUser) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.NOT_FOUND,
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  } else {
    await usersServices.forgotPassword(email)
    res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD
    })
  }
}
export const verifyForgotPasswordTokenController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordTokenReqBody>,
  res: Response,
  next: NextFunction
) => {
  //vao duoc day co nghia la forgot_password_token la hop le
  const { forgot_password_token } = req.body
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  await usersServices.checkPassworkToken({ user_id, forgot_password_token })
  //neu qua ham tren thi ok
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS
  })
}
export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  //vao duoc day co nghia la forgot_password_token la hop le
  const { forgot_password_token, password } = req.body
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  await usersServices.checkPassworkToken({ user_id, forgot_password_token })
  //neu qua ham tren thi ok

  await usersServices.resetPassword({ user_id, password })
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS
  })
}

export const getMeController = async (
  req: Request<ParamsDictionary, any, any>, //
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const userInfor = await usersServices.getMe(user_id) // hàm này ta chưa code, nhưng nó dùng user_id tìm user và trả ra user đó
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.GET_ME_SUCCESS,
    userInfor
  })
}
export const updateMeController = async (
  req: Request<ParamsDictionary, any, UpdateMeReqBody>, //
  res: Response,
  next: NextFunction
) => {
  //mguoi ta gui access_token len de chung minh la ho da dang nhap va dong thoi cho ta bt ho la ai thong qua cai payload do
  const { user_id } = req.decode_authorization as TokenPayload
  //req.body chua cac thuoc tinh ma nguoi dung cap nhat
  const payload = req.body //payload la tat ca noi dung nguoi dung gui len
  //ta muon acc phai verify thi moi duoc cap nhat
  await usersServices.checkEmailVerified(user_id)
  //neu goi ham tren ma kh co thi say ra thi user da verify roi
  //minh tien hanh cap nhat thong tin ma nguoi dung cung cap
  const userInfo = await usersServices.updateMe({ user_id, payload })
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.UPDATE_PROFILE_SUCCESS,
    userInfo
  })
}

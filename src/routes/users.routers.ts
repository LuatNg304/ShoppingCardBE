import express from 'express'
import { loginController, registerController } from '~/controllers/users.controllers'
import { loginValidator, registerValidator } from '~/middlewares/users.middlewares'
import { wraptAsync } from '~/utils/handlers'
const userRouter = express.Router()

//handler
userRouter.post('/login', loginValidator, loginController)
/*
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

export default userRouter

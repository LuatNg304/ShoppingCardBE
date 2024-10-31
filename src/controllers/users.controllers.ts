import { NextFunction, Request, Response } from 'express'
import { RegisterReqbody } from '~/models/requests/users.requests'
import User from '~/models/schemas/User.schema'
import usersServices from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
//controller la hnadle co nv tap ket du lieu nguou dung
//va phan phat vao cac server dung cho

//controller la noi tap ket va xu ly logiccho cac du lieu nhan duoc
//trong controller cac du lieu deu pjai clean

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  //len database kt emai va password
  if (email === 'lehodiep@gmail.com' && password === '123456') {
    res.status(200).json({
      //200 xac thuc thanh cong
      message: 'Login successfully !!!',
      data: {
        fname: 'Diep number 1',
        yob: 1999
      }
    })
  } else {
    res.status(401).json({
      //401 xac thuc that bai
      message: 'Invalid email or password'
    })
  }
}
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
      message: 'Email has been exited'
    })
  }
  const result = await usersServices.register(req.body)
  res.status(201).json({
    message: 'Register successFully!!',
    data: result
  })
}

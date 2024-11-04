import HTTP_STATUS from '~/constants/httpStatus'
import { Request, Response, NextFunction } from 'express'
import { omit } from 'lodash'
import { ErrorWithStatus } from '~/models/Errors'
export const defaultErrorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  //res.status(error.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).json(omit(error, '[status]'))

  //loi cua toan bo he thong do ve day
  //co hai loai: bth la throw Error va ErrorwithStatus
  if (error instanceof ErrorWithStatus) {
    res.status(error.status).json(omit(error, ['status']))
  } else {
    //loi bth khong co status
    Object.getOwnPropertyNames(error).forEach((key) => {
      Object.defineProperty(error, key, {
        enumerable: true
      })
    })
    //
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      errorInfor: omit(error, ['stack'])
    })
  }
}

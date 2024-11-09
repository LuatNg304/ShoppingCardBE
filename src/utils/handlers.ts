import { NextFunction, Request, RequestHandler, Response } from 'express'

//file dung de luu ham WrapAsync nhan vao 'Req HandlerA' sau do tra ra 'Req Handler B' co cau truc try catch benh trong va chay req handler A benh trong try
export const wraptAsync = <P, T>(func: RequestHandler<P, any, any, T>) => {
  return async (req: Request<P, any, any, T>, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next)
    } catch (err) {
      next(err)
    }
  }
}

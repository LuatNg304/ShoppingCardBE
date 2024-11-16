import { Request, Response, NextFunction } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import mediasService from '~/services/medias.services'

// console.log(__dirname) //log thử để xem
// console.log(path.resolve()) //D:\toturalReact2022\nodejs-backend\ch04-tweetProject
// console.log(path.resolve('uploads')) //D:\toturalReact2022\nodejs-backend\ch04-tweetProject\uploads

export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediasService.handleUploadImage(req)
  res.status(HTTP_STATUS.OK).json({
    message: 'Upload image success',
    url
  })
}
export const uploadVideoController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediasService.handleUploadVideo(req)
  res.status(HTTP_STATUS.OK).json({
    message: 'Upload video success',
    url
  })
}

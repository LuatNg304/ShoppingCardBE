import express, { Router } from 'express'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { serverImageController, serverVideoController } from '~/controllers/static.controllers'
const staticRouter = Router()

// staticRouter.use('/image', express.static(UPLOAD_IMAGE_DIR))
staticRouter.get('/image/:namefile', serverImageController)
//:namefile la kieu params
staticRouter.get('/video/:namefile', serverVideoController)
// staticRouter.use('/video', express.static(UPLOAD_VIDEO_DIR)) //chia se video theo kieu tung doan

export default staticRouter

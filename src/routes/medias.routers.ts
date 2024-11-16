import { Router } from 'express'
import { uploadImageController, uploadVideoController } from '~/controllers/medias.controllers'
import { wraptAsync } from '~/utils/handlers'
const mediaRouter = Router()

mediaRouter.post('/upload-image', wraptAsync(uploadImageController))
mediaRouter.post('/upload-video', wraptAsync(uploadVideoController))
export default mediaRouter

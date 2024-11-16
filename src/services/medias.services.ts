import { Request } from 'express'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { getNameFormidable, handleUploadImage, handleUploadVideo } from '~/utils/file'
import fs from 'fs'
import { Media } from '~/models/Other'
import { MediaType } from '~/constants/enums'
class MediasService {
  async handleUploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const result = await Promise.all(
      files.map(async (file) => {
        const newFileName = getNameFormidable(file.newFilename) + '.jpg'
        //duong dan den file moi se la
        const newPath = UPLOAD_IMAGE_DIR + '/' + newFileName
        //dung sharp de nen file lai
        await sharp(file.filepath).jpeg().toFile(newPath)
        //setup duong link
        fs.unlinkSync(file.filepath) //xoa hinh cu
        const url: Media = {
          url: `http://localhost:3000/static/image/${newFileName}`,
          type: MediaType.Image
        }
        return url
      })
    )
    return result
  }
  async handleUploadVideo(req: Request) {
    const files = await handleUploadVideo(req)
    const result = await Promise.all(
      files.map(async (file) => {
        const url: Media = {
          url: `http://localhost:3000/static/video/${file.newFilename}`,
          type: MediaType.Video
        }
        return url
      })
    )
    return result
  }
}
const mediasService = new MediasService()
export default mediasService

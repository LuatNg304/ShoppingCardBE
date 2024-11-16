import path from 'path'
import fs, { mkdir } from 'fs' //module chua cac method xu ly file
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { Request } from 'express'
import formidable, { File } from 'formidable'
export const initFolder = () => {
  //luu duong dan den thu muc se luu file
  //truy vet duong linh nay xem co den dupc thu muc nao khong
  //neu ma tim khon duoc se bi thi minh tao moi thu muc thoi
  ;[UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        //tao thu muc
        recursive: true //cho phep tao long cac thu muc
      })
    }
  })
}

//tao ham uploadImage
//ham nhan vao req bat no di qua formiable
//tu do lay duoc cac file benh trong req, chi chon cac file la image
//return cac file d ra ngoia
export const handleUploadImage = async (req: Request) => {
  //tao luoi loc tu formidable
  const form = formidable({
    uploadDir: UPLOAD_IMAGE_TEMP_DIR,
    maxFiles: 4,
    maxTotalFileSize: 300 * 1024 * 4,
    maxFileSize: 300 * 1024, //300kb
    keepExtensions: true, //giu lai dupi cua file
    filter: ({ name, originalFilename, mimetype }) => {
      //name la : la field dc gui thong qua form <input name ='filene'>
      //originalFilename: la ten goc cua file
      //mimetype: la kieu dinh dang file 'video/mp3' 'video/mkb' 'image/png' 'image/jpeg'
      const valid = name === 'image' && Boolean(mimetype?.includes('image'))
      if (!valid) {
        form.emit('error' as any, new Error('File Type Invalid !!!') as any)
      }
      return valid
    }
  })
  //co luoi roi thi ep req vao
  //callback nen xu ly thanh promise
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err)
      if (!files.image) return reject(new Error('Image is Empty'))
      return resolve(files.image)
    })
  })
}
export const handleUploadVideo = async (req: Request) => {
  //tao luoi loc tu formidable
  const form = formidable({
    uploadDir: UPLOAD_VIDEO_DIR,
    maxFiles: 1,

    maxFileSize: 50 * 1024 * 1024, //300kb
    keepExtensions: true, //giu lai dupi cua file
    filter: ({ name, originalFilename, mimetype }) => {
      //name la : la field dc gui thong qua form <input name ='filene'>
      //originalFilename: la ten goc cua file
      //mimetype: la kieu dinh dang file 'video/mp3' 'video/mkb' 'image/png' 'image/jpeg'
      const valid = name === 'video' && Boolean(mimetype?.includes('video'))
      if (!valid) {
        form.emit('error' as any, new Error('File Type Invalid !!!') as any)
      }
      return valid
    }
  })
  //co luoi roi thi ep req vao
  //callback nen xu ly thanh promise
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err)
      if (!files.video) return reject(new Error('Video is Empty'))
      return resolve(files.video)
    })
  })
}
//vietham nhan vao fullFileName lay ten bo duoi
export const getNameFormidable = (filename: string) => {
  const nameArr = filename.split('.')
  nameArr.pop() //bo phan tu cuoi
  return nameArr.join('-')
}

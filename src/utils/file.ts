import path from 'path'
import fs, { mkdir } from 'fs' //module chua cac method xu ly file
export const initFolder = () => {
  //luu duong dan den thu muc se luu file
  const uploadFolderPath = path.resolve('uploads')
  //truy vet duong linh nay xem co den dupc thu muc nao khong
  //neu ma tim khon duoc se bi thi minh tao moi thu muc thoi
  if (!fs.existsSync(uploadFolderPath)) {
    fs.mkdirSync(uploadFolderPath, {
      //tao thu muc
      recursive: true //cho phep tao long cac thu muc
    })
  }
}

//import cac interface cua express
import { error } from 'console'
import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'
import { validate } from '~/utils/validation'
//middleware la  handler co nhiem vy kiem trs cac du lieu ma nguoi dung gui len thong qua request
//middleware  giu vai tro kiem tra du lieu du va dung kieu

//bay gio se mo ta truc nang dang nhap
//neu mot nguoi dung muon dang nhap ho se gui len email va password
//thong qua req.body
export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  //kiem tra
  //lay thu email va password benh trong body nguoi dung gui len
  const { email, password } = req.body
  //kiem tra email co dc gui len hay khong
  if (!email || !password) {
    res.status(422).json({
      //422: gui thieu
      message: 'Missing email or password'
    })
  } else {
    next()
  }
}
export const registerValidator = validate(
  checkSchema({
    name: {
      notEmpty: {
        errorMessage: 'Name is required'
      },
      isString: {
        errorMessage: 'Name must be a String'
      },
      trim: true,
      isLength: {
        options: {
          min: 1,
          max: 100
        },
        errorMessage: "Name's length must be beween 1 and 100"
      }
    },
    email: {
      notEmpty: {
        errorMessage: 'Email is required'
      },
      isEmail: true,
      trim: true
    },
    password: {
      notEmpty: {
        errorMessage: 'Password is required'
      },
      isString: {
        errorMessage: 'Password must be string'
      },
      isLength: {
        options: {
          min: 8,
          max: 50
        },
        errorMessage: "Password'legth must be betseen 8 and 50"
      },
      isStrongPassword: {
        options: {
          minLength: 1,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
          //returnScore: true
        },
        errorMessage: 'Your password must be at least 8 characters, 1 lowercase, 1 uppercase, 1 number and 1 symbols'
      }
    },
    confirm_password: {
      notEmpty: {
        errorMessage: 'confirm_password is required'
      },
      isString: {
        errorMessage: 'confirm_password must be string'
      },
      isLength: {
        options: {
          min: 8,
          max: 50
        },
        errorMessage: "confirm_password'legth must be betseen 8 and 50"
      },
      isStrongPassword: {
        options: {
          minLength: 1,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
          //returnScore: true
        },
        errorMessage:
          'Your confirm_password must be at least 8 characters, 1 lowercase, 1 uppercase, 1 number and 1 symbols'
      },
      custom: {
        options: (value, { req }) => {
          //value: confirm_password
          if (value !== req.body.password) {
            throw new ErrorWithStatus({
              status: HTTP_STATUS.UNAUTHORIZED, //401
              message: "Confirm_passwork doesn't matched"
            })
          } else {
            return true
          }
        }
      }
    },
    date_of_birth: {
      isISO8601: {
        options: {
          strict: true,
          strictSeparator: true
        }
      }
    }
  })
)

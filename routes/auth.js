import { buildErrObject, handleError } from '../config/utils';
import User from '../models/user';

const checkPermissions = async (data, next) => {
  return new Promise((resolve, reject) => {

    User.findById(data.id)
      .then(result => {
        if (data.roles.indexOf(result.role) > -1) {
          return resolve(next())
        }
        return reject(buildErrObject(401, 'UNAUTHORIZED'))
      })
      .catch(err => {
        reject(buildErrObject(422, err.message))
      });

    // User.findById(data.id, (err, result) => {
    //   if (err) {
    //     reject(buildErrObject(422, err.message))
    //   }
    //   if (!result) {
    //     reject(buildErrObject(404, 'NOT_FOUND'))
    //   }
    //   if (data.roles.indexOf(result.role) > -1) {
    //     return resolve(next())
    //   }
    //   return reject(buildErrObject(401, 'UNAUTHORIZED'))
    // })
  })
};

export const roleAuthorization = roles => async (req, res, next) => {

  try {
    const data = {
      id: req.user.id,
      roles
    };
    await checkPermissions(data, next)
  } catch (error) {
    handleError(res, error)
  }
};

export default roleAuthorization;

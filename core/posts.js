const { Post } = require('../db/models');
const Sequelize = require('sequelize');

exports.fetch = async (req, query) => {
  const {
    search,
    sort = 'createdAt',
    order = 'DESC',
    limit = '10',
    page = '1'
  } = query;

  const options = {
    attributes: [
      'id', 
      'title', 
      'content', 
      'thumbnail', 
      'userId', 
      'categoryId', 
      'createdAt'
    ],
    page: parseInt(page), // Default 1
    paginate: parseInt(limit), // Default 25
    order: [[sort, order]],
    // where: []
  };

  if(search) {
    options.attributes.push([Sequelize.literal(`MATCH (title, content) AGAINST ('*${search}*' IN BOOLEAN MODE)`), 'relevance']);
    options.order.unshift([Sequelize.literal('relevance'), 'DESC']);
    options.where = Sequelize.literal(`MATCH (title, content) AGAINST ('*${search}*' IN BOOLEAN MODE)`);
  }
  
  return new Promise(
    async (resolve, reject) => {
      await Post.paginate(options)
        .then(result => {
          if(result.docs.length < -1) {
            resolve({
              code: 404,
              message: 'NO_RECORDS'
            });
          }
          resolve({
            code: 200,
            message: 'SUCCESSFUL_REQUEST',
            data: result
          });
        })
        .catch(e => {
          reject({
            code: 422,
            message: e.message
          });
        });
    }
  );
};

exports.get = async id => {
  return new Promise(
    (resolve, reject) => {
      Post.findById(id)
        .then(result => {
          if (!result) {
            reject({
              code: 404,
              message: 'NOT_FOUND'
            });
          }
          resolve({
            code: 200,
            message: 'SUCCESSFUL_REQUEST',
            data: result
          });
        })
        .catch(err => {
          reject({
            code: 422,
            message: err.message
          });
        });
    }
  );
};

exports.update = async (id, req) => {
  const { title, content, thumbnail } = req.body;
  return new Promise(
    (resolve, reject) => {
      Post.findById(id)
        .then(result => {
          if(!result) {
            reject({
              code: 404,
              message: 'NOT_FOUND'
            });
          }
          else if(result.userId !== req.decoded.id) {
            reject({
              code: 403,
              message: 'FORBIDDEN'
            });
          }
          else {
            result.title = title;
            result.content = content;
            result.thumbnail = thumbnail;
            result.save();
            resolve({
              code: 200,
              message: 'UPDATED_SUCCESSFULLY',
              data: result
            });
          }
          reject({
            code: 400,
            message: 'COULD_NOT_BE_UPDATED'
          });
        })
        .catch(err => {
          if (err.errors.length > -1) {
            reject({
              code: 422,
              data: err.errors.map(e => ({ [e.path]: e.message }) )
            });
          }
          reject({
            code: 422, 
            message: err.message
          });
        });
    }
  );
};

exports.create = async req => {
  const {
    title,
    content,
    thumbnail
  } = req.body;
  return new Promise(
    (resolve, reject) => {
      Post.create({
        title,
        content,
        thumbnail,
        userId: req.decoded.id
      })
        .then(result => {
          if(result) {
            resolve({
              code: 200,
              message: 'CREATED_SUCCESSFULLY',
              data: result
            });
          }
          reject({
            code: 400,
            message: 'COULD_NOT_BE_CREATED'
          });
        })
        .catch(err => {
          if (err.errors.length > -1) {
            reject({
              code: 422,
              data: err.errors.map(e => ({ [e.path]: e.message }) )
            });
          }
          reject({
            code: 422, 
            message: err.message
          });
        });
    }
  );
};

exports.delete = async (id, req) => {
  const { title, content, thumbnail } = req.body;
  return new Promise(
    (resolve, reject) => {
      Post.findById(id)
        .then(result => {
          if(!result) {
            reject({
              code: 404,
              message: 'NOT_FOUND'
            });
          }
          else if(result.userId !== req.decoded.id) {
            reject({
              code: 403,
              message: 'FORBIDDEN'
            });
          }
          else {
            result.destroy();
            resolve({
              code: 200,
              message: 'DELETED_SUCCESSFULLY'
            });
          }
          reject({
            code: 400,
            message: 'COULD_NOT_BE_DELETED'
          });
        })
        .catch(err => {
          reject({
            code: 422, 
            message: err.message
          });
        });
    }
  );
};

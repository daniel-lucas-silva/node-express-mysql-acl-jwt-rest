const router = require('express').Router();
const trimRequest = require('trim-request');

const {
  handleError,
  acl
} = require('../../core/base');
const posts = require('../../core/posts');

router
  .get('/', async (req, res, next) => {
    try {
      var url = require('url');
      var { query } = url.parse(req.url, true);
      
      res
        .status(200)
        .json(
          await posts.fetch(req, query)
        );
    } catch (error) {
      handleError(res, error);
    }
  })
  .post('/', acl(['user', 'admin']), trimRequest.all, async (req, res, next) => {
      try {
        const result = await posts.create(
          req
        );
        res.status(201).json(result);
      } catch (error) {
        handleError(res, error);
      }
    }
  )
  .get( '/:id', async (req, res, next) => {
      try {
        res
          .status(200)
          .json(
            await posts.get(
              req.params.id
            )
          );
      } catch (error) {
        return res
          .status(422)
          .json({ error });
      }
    }
  )
  .patch('/:id', acl(['user', 'admin']), trimRequest.all, async (req, res, next) => {
      try {
        const result = await posts.update(
          req.params.id,
          req
        );
        res.status(201).json(result);
      } catch (error) {
        return res
          .status(422)
          .json({ error });
      }
    }
  )
  .delete('/:id', acl(['user', 'admin']), async (req, res, next) => {
      try {
        const result = await posts.delete(
          req.params.id,
          req
        );
        res.status(201).json(result);
      } catch (error) {
        return res
          .status(422)
          .json({ error });
      }
    }
  );

module.exports = router;

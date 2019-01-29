const router = require('express').Router();
const trimRequest = require('trim-request');
const url = require('url');

const {
  handleError,
  acl
} = require('../../core/base');
const posts = require('../../core/posts');

router
  /**
   * Fetch posts with pagination and fulltext search
   * ?search=[TEXT]&limit=[INTEGER]&page=[INTEGER]&sort=[COLUMN]&order=[DESC|ASC]
   */
  .get('/', async (req, res, next) => {
    try {
      const { query } = url.parse(req.url, true);
      const results = await posts.fetch(req, query);

      res
        .status(200)
        .json(results);
    } catch (error) {
      handleError(res, error);
    }
  })
  /**
   * Create post
   */
  .post('/', acl(['user', 'admin']), trimRequest.all, async (req, res, next) => {
      try {
        const result = await posts.create(req);

        res
          .status(201)
          .json(result);
      } catch (error) {
        handleError(res, error);
      }
    }
  )
  /**
   * Get a single post
   */
  .get( '/:id', async (req, res, next) => {
      try {
        const result = await posts.get(req.params.id);

        res
          .status(200)
          .json(result);
      } catch (error) {
        handleError(res, error);
      }
    }
  )
  /**
   * Update post
   */
  .patch('/:id', acl(['user', 'admin']), trimRequest.all, async (req, res, next) => {
      try {
        const result = await posts.update(
          req.params.id,
          req
        );

        res
          .status(201)
          .json(result);
      } catch (error) {
        handleError(res, error);
      }
    }
  )
  /**
   * Delete post
   */
  .delete('/:id', acl(['user', 'admin']), async (req, res, next) => {
      try {
        const result = await posts.delete(
          req.params.id,
          req
        );

        res
          .status(201)
          .json(result);
      } catch (error) {
        handleError(res, error);
      }
    }
  );

module.exports = router;

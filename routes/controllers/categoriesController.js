const router = require('express').Router();
const trimRequest = require('trim-request');
const url = require('url');

const {
  handleError,
  acl
} = require('../../core/base');
const categories = require('../../core/categories');

router
  /**
   * Fetch categories with pagination and fulltext search
   * ?search=[TEXT]&limit=[INTEGER]&page=[INTEGER]&sort=[COLUMN]&order=[DESC|ASC]
   */
  .get('/', async (req, res, next) => {
    try {
      const { query } = url.parse(req.url, true);
      const results = await categories.fetch(req, query);

      res
        .status(200)
        .json(results);
    } catch (error) {
      handleError(res, error);
    }
  })
  /**
   * Create category
   */
  .post('/', acl(['admin']), trimRequest.all, async (req, res, next) => {
      try {
        const result = await categories.create(req);

        res
          .status(201)
          .json(result);
      } catch (error) {
        handleError(res, error);
      }
    }
  )
  /**
   * Get a single category
   */
  .get( '/:id', async (req, res, next) => {
      try {
        const result = await categories.get(req.params.id);

        res
          .status(200)
          .json(result);
      } catch (error) {
        handleError(res, error);
      }
    }
  )
  /**
   * Update category
   */
  .patch('/:id', acl(['admin']), trimRequest.all, async (req, res, next) => {
      try {
        const result = await categories.update(
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
   * Delete category
   */
  .delete('/:id', acl(['admin']), async (req, res, next) => {
      try {
        const result = await categories.delete(
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

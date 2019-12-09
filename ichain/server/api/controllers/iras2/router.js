import * as express from 'express';
import controller from './controller';

export default express
  .Router()
  .get('/:id', controller.getFile)
  .post('/add', controller.add)

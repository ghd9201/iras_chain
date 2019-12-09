import * as express from 'express';
import controller from './controller';



export default express
  .Router()
  .post('/', controller.create)
  .get('/', controller.all)
  .get('/test', controller.test)
  .get('/hello',controller.hello)
  .get('/:id', controller.byId);

import * as express from 'express';
import controller from './controller';

export default express
  .Router()
  .post('/addFile', controller.addFile)
  .post('/getFileRecord:fileHash', controller.getFileRecordHash)
  .post('/getFileRecord:fileName', controller.getFileRecordName)


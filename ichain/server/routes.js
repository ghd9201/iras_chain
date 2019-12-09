import examplesRouter from './api/controllers/examples/router';
import balanceRouter from './api/controllers/balance/router';
import irasRouter from './api/controllers/iras/router';

export default function routes(app) {
  app.use('/api/v1/examples', examplesRouter);
  app.use('/api/v1/balance', balanceRouter);	
  app.use('/api/v1/iras', irasRouter);
}

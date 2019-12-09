import IrasService from '../../services/iras/iras.service';

export class Controller {
  getFile(req, res) {
    IrasService
      .getFile(req, res)
      .then(r => {
        if (r) res.json(r);
        else res.status(404).end();
      });
  }

  add(req, res) {
    IrasService
      .add(req, res)
      .then(r => {
        if (r) res.json(r);
        else res.status(404).end();
      });
  }

}
export default new Controller();

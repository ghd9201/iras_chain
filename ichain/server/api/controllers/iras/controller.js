import IrasService from '../../services/iras/iras.service';

export class Controller {

  addFile(req, res) {
    IrasService
      .addFile(req, res)
      .then(r => {
        if (r) res.json(r);
        else res.status(404).end();
      });
  }
}
export default new Controller();

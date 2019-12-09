import IrasService from '../../services/iras/iras.service';
import BalanceService from "../../services/balance/balance.service";

export class Controller {

  addFile(req, res) {
    IrasService
      .addFile(req, res)
      .then(r => {
        if (r) res.json(r);
        else res.status(404).end();
      });
  }

  getFileRecordHash(req, res) {
     IrasService
      .getFileRecordHash(req, res)
      .then(r => {
        if (r) res.json(r);
        else res.status(404).end();
      });
  }

  getFileRecordName(req, res) {
     IrasService
       .getFileRecordName(req, res)
       .then(r => {
         if (r) res.json(r);
         else res.status(404).end();
      });
    }

}
export default new Controller();

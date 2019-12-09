import l from '../../../common/logger';

const transaction = require('../../../blockchain/transaction/transaction');

class IrasService {
  addFile(req, res) {

    l.info(`${this.constructor.name}.byId(${req})`);
    const args = [];
    const peers = [];

    /*
    var org = req.body.org;

    var peer = '';

    if( org == 'Org1')
      peer = 'peer0.org1.iras.com';
    else
      peer = 'peer0.org2.iras.com';
*/

    var org = 'org1';
    var peer = 'peer0.org1.iras.com';

    args.push(req.body.fileHash);
    args.push(req.body.fileName);
    args.push(req.body.userName);
    args.push(req.body.security);
    args.push(req.body.fileSize.toString());
    args.push(req.body.accessType);
    args.push(req.body.result);
    args.push(req.body.date);
    args.push(req.body.description);

    peers.push(peer);

    l.debug(`invoke peers:${peers}`);

    return Promise.resolve(transaction.invokeChainCode(peers, 'iraschannel', 'iras', 'addFile', args, 'admin',org));

  }
}

export default new IrasService();

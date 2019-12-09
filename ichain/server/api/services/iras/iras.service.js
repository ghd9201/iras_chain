import l from '../../../common/logger';

const transaction = require('../../../blockchain/transaction/transaction');

class IrasService {
  addFile(req, res) {
    l.info(`${this.constructor.name}.byId(${req})`);
    const args = [];
    const peers = [];

    const org = req.body.organization;
    var peer = '';

    if(org == 'Org1')
      peer = 'peer0.org1.iras.com';
    else if(org == 'Org2')
      peer = 'peer0.org2.iras.com';
    else
      return false;


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

  getFileRecordHash(req, res) {
    const args = [];

    args.push(req.params.fileHash);
    return Promise.resolve(transaction.queryChainCode(null, 'iraschannel', 'iras',
        args, 'query', 'admin', 'Org1'));
  }

  getFileRecordName(req, res) {
    const args = [];

    args.push(req.params.fileName);
    return Promise.resolve(transaction.queryChainCode(null, 'iraschannel', 'iras',
        args, 'query', 'admin', 'Org1'));
  }
}

export default new IrasService();

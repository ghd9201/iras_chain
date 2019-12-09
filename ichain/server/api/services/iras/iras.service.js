import l from '../../../common/logger';

const transaction = require('../../../blockchain/transaction/transaction');

class IrasService {
  addFile(req, res) {
    l.info(`${this.constructor.name}.byId(${req})`);
    const args = [];
    const peers = [];
//    const peers2 = [];
    const peers2 = [];

    args.push(req.body.fileHash);
    args.push(req.body.fileName);
    args.push(req.body.userName);
    args.push(req.body.security);
    args.push(req.body.fileSize.toString());
    args.push(req.body.accessType);
    args.push(req.body.result);
    args.push(req.body.date);
    args.push(req.body.description);

    peers.push('peer0.org1.iras.com');
    peers2.push('peer0.org2.iras.com');
    //peers1.push('peer1.org1.cauiras.com');
    //peers2.push('peer0.org2.cauiras.com');
    //peers2.push('peer1.org2.cauiras.com');

    l.debug(`invoke peers:${peers}`);
    Promise.resolve(transaction.invokeChainCode(peers, 'iraschannel', 'iras', 'addFile', args, 'admin','Org1'));
    return Promise.resolve(transaction.invokeChainCode(peers2, 'iraschannel', 'iras', 'addFile', args, 'admin','Org2'));
	  
    //return Promise.resolve(transaction.invokeChainCode(peers2, 'iraschannel', 'iras',
      //'addFile', args, 'admin', 'Org2'));
  }
}

export default new IrasService();

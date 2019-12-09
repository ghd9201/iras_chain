/* eslint-disable prefer-destructuring */

const log4js = require('log4js');

const logger = log4js.getLogger('Transaction');
logger.setLevel('DEBUG');

const util = require('util');
const hlf = require('../hlf-client');

class TrxClient {
  async queryChainCode(peer, channelName, chaincodeName, args, fcn, username, orgName) {
    try {
      const client = await hlf.getAdminClientForOrg(orgName);
      logger.debug('Successfully got the fabric client for the organization "%s"', orgName);
      const channel = client.getChannel(channelName);
      if (!channel) {
        const message = util.format('Channel %s was not defined in the connection profile', channelName);
        logger.error(message);
        throw new Error(message);
      }

      // send query
      const request = {
        // targets: [peer], // queryByChaincode allows for multiple targets
        chaincodeId: chaincodeName,
        fcn,
        args,
      };
      const responsePayLoads = await channel.queryByChaincode(request);
      if (responsePayLoads) {
        for (let i = 0; i < responsePayLoads.length; i++) {
          logger.info(`${args[0]} now has ${responsePayLoads[i].toString('utf8')
          } after the move`);
        }
        return `${args[0]} now has ${responsePayLoads[0].toString('utf8')
        } after the move`;
      }
      logger.error('responsePayLoads is null');
      return 'responsePayLoads is null';
    } catch (error) {
      logger.error(`Failed to query due to error: ${error.stack}` ? error.stack : error);
      return error.toString();
    }
  }

  async invokeChainCode(peerNames, channelName, chaincodeName, fcn, args, username, orgName) {
    logger.debug(util.format('\n============ invoke transaction on channel %s ============\n', channelName));
    let errorMsg = null;
    let txIdString = null;
    try {
      // first setup the client for this org
      const client = await hlf.getAdminClientForOrg(orgName);
      logger.debug('Successfully got the fabric client for the organization "%s"', orgName);
      const channel = client.getChannel(channelName);
      if (!channel) {
        const message = util.format('Channel %s was not defined in the connection profile', channelName);
        logger.error(message);
        throw new Error(message);
      }
      const txId = client.newTransactionID();
      // will need the transaction ID string for the event registration later
      txIdString = txId.getTransactionID();

      // send proposal to endorser
      const request = {
        targets: peerNames,
        chaincodeId: chaincodeName,
        fcn,
        args,
        chainId: channelName,
        txId,
      };
      logger.debug('request:' + JSON.stringify(request));

      const results = await channel.sendTransactionProposal(request);

      // the returned object has both the endorsement results
      // and the actual proposal, the proposal will be needed
      // later when we send a transaction to the orderer
      const proposalResponses = results[0];
      const proposal = results[1];

      // lets have a look at the responses to see if they are
      // all good, if good they will also include signatures
      // required to be committed
      let allGood = true;
      for (const i in proposalResponses) {
        logger.info(util.format(
          'AAAA sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s',
          proposalResponses[0].response.status, proposalResponses[0].response.message,
          proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature));

        let oneGood = false;
        if (proposalResponses && proposalResponses[i].response &&
          proposalResponses[i].response.status === 200) {
          oneGood = true;
          logger.info('invoke chaincode proposal was good');
        } else {
          logger.error(JSON.stringify(proposalResponses));
          logger.error('invoke chaincode proposal was bad');
        }
        allGood = allGood & oneGood;
      }

      if (allGood) {
        logger.info(util.format(
          'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s',
          proposalResponses[0].response.status, proposalResponses[0].response.message,
          proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature));

        // wait for the channel-based event hub to tell us
        // that the commit was good or bad on each peer in our organization
        const promises = [];
        const eventHubs = channel.getChannelEventHubsForOrg();
        eventHubs.forEach(eh => {
          logger.debug('invokeEventPromise - setting up event');
          const invokeEventPromise = new Promise((resolve, reject) => {
            const ehTimeOut = setTimeout(() => {
              const message = `REQUEST_TIMEOUT:${eh.getPeerAddr()}`;
              logger.error(message);
              eh.disconnect();
            }, 3000);
            eh.registerTxEvent(txIdString, (tx, code, blockNum) => {
              logger.info('The chaincode invoke chaincode transaction has been committed on peer %s', eh.getPeerAddr());
              logger.info('Transaction %s has status of %s in blocl %s', tx, code, blockNum);
              clearTimeout(ehTimeOut);

              if (code !== 'VALID') {
                const message = util.format('The invoke chaincode transaction was invalid, code:%s', code);
                logger.error(message);
                reject(new Error(message));
              } else {
                const message = 'The invoke chaincode transaction was valid.';
                logger.info(message);
                resolve(message);
              }
            }, err => {
              clearTimeout(ehTimeOut);
              logger.error(err);
              reject(err);
            },
              // the default for 'unregister' is true for transaction listeners
              // so no real need to set here, however for 'disconnect'
              // the default is false as most event hubs are long running
              // in this use case we are using it only once
            { unregister: true, disconnect: false },
            );
            eh.connect();
          });
          promises.push(invokeEventPromise);
        });

        const ordererReq = {
          txId,
          proposalResponses,
          proposal,
        };
        const sendPromise = channel.sendTransaction(ordererReq);
        // put the send to the orderer last so that the events get registered and
        // are ready for the orderering and committing
        promises.push(sendPromise);
        const results = await Promise.all(promises);
        logger.debug(util.format('------->>> R E S P O N S E : %j', results));
        const response = results.pop(); //  orderer results are last in the results
        if (response.status === 'SUCCESS') {
          logger.info('Successfully sent transaction to the orderer.');
        } else {
          errorMsg = util.format('Failed to order the transaction. Error code: %s', response.status);
          logger.debug(errorMsg);
        }

        // now see what each of the event hubs reported
        for (const i in results) {
          const ehResult = results[i];
          const eh = eventHubs[i];
          logger.debug('Event results for event hub :%s', eh.getPeerAddr());
          if (typeof ehResult === 'string') {
            logger.debug(ehResult);
          } else {
            if (!errorMsg) errorMsg = ehResult.toString();
            logger.debug(ehResult.toString());
          }
        }
      } else {
        errorMsg = util.format('Failed to send Proposal and receive all good ProposalResponse');
        logger.debug(errorMsg);
      }
    } catch (error) {
      logger.error(`Failed to invoke due to error: ${error.stack}` ? error.stack : error);
      errorMsg = error.toString();
    }

    if (!errorMsg) {
      const message = util.format(
        'Successfully invoked the chaincode %s to the channel \'%s\' for transaction ID: %s',
        orgName, channelName, txIdString);
      logger.info(message);

      return txIdString;
    }
    const message = util.format('Failed to invoke chaincode. cause:%s', errorMsg);
    logger.error(message);
    throw new Error(message);
  }
}

const trxClient = new TrxClient();
module.exports = trxClient;

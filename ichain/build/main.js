require('source-map-support/register')
module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 8);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pino = __webpack_require__(19);

var _pino2 = _interopRequireDefault(_pino);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const l = (0, _pino2.default)({
  name: process.env.APP_ID,
  level: process.env.LOG_LEVEL
});

exports.default = l;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/* eslint-disable prefer-destructuring */

const log4js = __webpack_require__(4);

const logger = log4js.getLogger('HLF');
const hfc = __webpack_require__(5);
const member = __webpack_require__(20);

logger.setLevel('DEBUG');
hfc.setLogger(logger);

class HlfClient {
  constructor() {
    this._hfc = null;
    this._orgs = null;
    this._stateStore = {};
    this._cryptoSuite = {};
  }

  setClient() {
    this._hfc = hfc.loadFromConfig(hfc.getConfigSetting('network-connection-profile-path'));
    this._orgs = this._hfc._network_config._network_config.organizations;
    this._setFSKeyValueStore(this._orgs);
    this._checkAdminClient(this._orgs);
  }

  _setFSKeyValueStore(orgs) {
    const orgArr = Object.keys(orgs);
    orgArr.forEach(async orgName => {
      this._hfc.loadFromConfig(hfc.getConfigSetting(`${orgName}-connection-profile-path`));
      await this._initCredentialStores(this._hfc, orgName);
    });
  }

  async _initCredentialStores(client, orgName) {
    const clientConfig = client._network_config.getClientConfig();
    return hfc.newDefaultKeyValueStore(clientConfig.credentialStore).then(store => {
      client.setStateStore(store);
      this._stateStore[orgName] = store;
      return hfc.newCryptoKeyStore(clientConfig.credentialStore.cryptoStore);
    }).then(cryptoKeyStore => {
      const cryptoSuite = hfc.newCryptoSuite();
      cryptoSuite.setCryptoKeyStore(cryptoKeyStore);
      client.setCryptoSuite(cryptoSuite);
      this._cryptoSuite[orgName] = cryptoSuite;
      return Promise.resolve();
    });
  }

  _checkAdminClient(orgs) {
    const isAdmin = hfc.getConfigSetting('isAdminClient');
    const orgArr = Object.keys(orgs);

    if (isAdmin === 'true') {
      orgArr.forEach(async orgName => {
        await this._setupAdminAccount(orgName);
      });
    }
  }

  async _setupAdminAccount(orgName) {
    const organizationConfig = this._hfc._network_config.getOrganization(orgName, true);

    const client = new hfc();
    client.loadFromConfig(hfc.getConfigSetting(`${orgName}-connection-profile-path`));
    await client.initCredentialStores();

    const mspId = organizationConfig.getMspid();
    const adminKey = organizationConfig.getAdminPrivateKey();
    const adminCert = organizationConfig.getAdminCert();

    await member.createAdmin(client, mspId, adminKey, adminCert);
  }

  getAdminClientForOrg(orgName) {
    return new Promise(async (resolve, reject) => {
      if (this._hfc) {
        this._hfc.loadFromConfig(hfc.getConfigSetting(`${orgName}-connection-profile-path`));
        this._hfc.setStateStore(this._stateStore[orgName]);
        this._hfc.setCryptoSuite(this._cryptoSuite[orgName]);
        const organizationConfig = this._hfc._network_config.getOrganization(orgName, true);
        const mspId = organizationConfig.getMspid();
        await member.getAdminContext(this._hfc, mspId);
        resolve(this._hfc);
      } else {
        reject(new Error('Failed to Get Admin Client'));
      }
    });
  }
}

const hlfClient = new HlfClient();
module.exports = hlfClient;

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("log4js");

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("fabric-client");

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("util");

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/* eslint-disable prefer-destructuring */

const log4js = __webpack_require__(4);

const logger = log4js.getLogger('Transaction');
logger.setLevel('DEBUG');

const util = __webpack_require__(6);
const hlf = __webpack_require__(3);

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
        args
      };
      const responsePayLoads = await channel.queryByChaincode(request);
      if (responsePayLoads) {
        for (let i = 0; i < responsePayLoads.length; i++) {
          logger.info(`${args[0]} now has ${responsePayLoads[i].toString('utf8')} after the move`);
        }
        return `${args[0]} now has ${responsePayLoads[0].toString('utf8')} after the move`;
      }
      logger.error('responsePayLoads is null');
      return 'responsePayLoads is null';
    } catch (error) {
      logger.error( true ? error.stack : error);
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
        txId
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
        logger.info(util.format('AAAA sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s', proposalResponses[0].response.status, proposalResponses[0].response.message, proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature));

        let oneGood = false;
        if (proposalResponses && proposalResponses[i].response && proposalResponses[i].response.status === 200) {
          oneGood = true;
          logger.info('invoke chaincode proposal was good');
        } else {
          logger.error(JSON.stringify(proposalResponses));
          logger.error('invoke chaincode proposal was bad');
        }
        allGood = allGood & oneGood;
      }

      if (allGood) {
        logger.info(util.format('Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s', proposalResponses[0].response.status, proposalResponses[0].response.message, proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature));

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
            { unregister: true, disconnect: false });
            eh.connect();
          });
          promises.push(invokeEventPromise);
        });

        const ordererReq = {
          txId,
          proposalResponses,
          proposal
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
      logger.error( true ? error.stack : error);
      errorMsg = error.toString();
    }

    if (!errorMsg) {
      const message = util.format('Successfully invoked the chaincode %s to the channel \'%s\' for transaction ID: %s', orgName, channelName, txIdString);
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

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(9);


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

__webpack_require__(10);

var _server = __webpack_require__(12);

var _server2 = _interopRequireDefault(_server);

var _routes = __webpack_require__(22);

var _routes2 = _interopRequireDefault(_routes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = new _server2.default().router(_routes2.default).listen(process.env.PORT);

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _dotenv = __webpack_require__(11);

var _dotenv2 = _interopRequireDefault(_dotenv);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_dotenv2.default.config();

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = require("dotenv");

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(__dirname) {

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = __webpack_require__(1);

var _express2 = _interopRequireDefault(_express);

var _path = __webpack_require__(2);

var path = _interopRequireWildcard(_path);

var _bodyParser = __webpack_require__(13);

var bodyParser = _interopRequireWildcard(_bodyParser);

var _http = __webpack_require__(14);

var http = _interopRequireWildcard(_http);

var _os = __webpack_require__(15);

var os = _interopRequireWildcard(_os);

var _cookieParser = __webpack_require__(16);

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _swagger = __webpack_require__(17);

var _swagger2 = _interopRequireDefault(_swagger);

var _logger = __webpack_require__(0);

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright 2018 (주)KT All Rights Reserved.
 *
 *
 */

const hlf = __webpack_require__(3);
__webpack_require__(21);

const app = new _express2.default();

class ExpressServer {
  constructor() {
    const root = path.normalize(`${__dirname}/../..`);
    app.set('appPath', `${root}client`);
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use((0, _cookieParser2.default)(process.env.SESSION_SECRET));
    app.use(_express2.default.static(`${root}/public`));

    hlf.setClient();
  }

  router(routes) {
    (0, _swagger2.default)(app, routes);
    return this;
  }

  listen(port = process.env.PORT) {
    const welcome = p => () => _logger2.default.info(`up and running in ${"development" || 'development'} @: ${os.hostname()} on port: ${p}}`);
    http.createServer(app).listen(port, welcome(port));
    return app;
  }
}
exports.default = ExpressServer;
/* WEBPACK VAR INJECTION */}.call(exports, "server/common"))

/***/ }),
/* 13 */
/***/ (function(module, exports) {

module.exports = require("body-parser");

/***/ }),
/* 14 */
/***/ (function(module, exports) {

module.exports = require("http");

/***/ }),
/* 15 */
/***/ (function(module, exports) {

module.exports = require("os");

/***/ }),
/* 16 */
/***/ (function(module, exports) {

module.exports = require("cookie-parser");

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(__dirname) {

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (app, routes) {
  (0, _swaggerExpressMiddleware2.default)(path.join(__dirname, 'Api.yaml'), app, (err, mw) => {
    // Enable Express' case-sensitive and strict options
    // (so "/entities", "/Entities", and "/Entities/" are all different)
    app.enable('case sensitive routing');
    app.enable('strict routing');

    app.use(mw.metadata());
    app.use(mw.files({
      // Override the Express App's case-sensitive 
      // and strict-routing settings for the Files middleware.
      caseSensitive: false,
      strict: false
    }, {
      useBasePath: true,
      apiPath: process.env.SWAGGER_API_SPEC
      // Disable serving the "Api.yaml" file
      // rawFilesPath: false
    }));

    app.use(mw.parseRequest({
      // Configure the cookie parser to use secure cookies
      cookie: {
        secret: process.env.SESSION_SECRET
      },
      // Don't allow JSON content over 100kb (default is 1mb)
      json: {
        limit: process.env.REQUEST_LIMIT
      }
    }));

    // These two middleware don't have any options (yet)
    app.use(mw.CORS(), mw.validateRequest());

    // Error handler to display the validation error as HTML
    app.use((err, req, res, next) => {
      // eslint-disable-line no-unused-vars, no-shadow
      res.status(err.status || 500);
      res.send(`<h1>${err.status || 500} Error</h1>` + `<pre>${err.message}</pre>`);
    });

    routes(app);
  });
};

var _swaggerExpressMiddleware = __webpack_require__(18);

var _swaggerExpressMiddleware2 = _interopRequireDefault(_swaggerExpressMiddleware);

var _path = __webpack_require__(2);

var path = _interopRequireWildcard(_path);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/* WEBPACK VAR INJECTION */}.call(exports, "server/common/swagger"))

/***/ }),
/* 18 */
/***/ (function(module, exports) {

module.exports = require("swagger-express-middleware");

/***/ }),
/* 19 */
/***/ (function(module, exports) {

module.exports = require("pino");

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _logger = __webpack_require__(0);

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getAdminContext(client, mspId) {
  return client.getUserContext(`${mspId}Admin`, true).then(user => new Promise((resolve, reject) => {
    if (user && user.isEnrolled()) {
      _logger2.default.info(`Successfully loaded ${user._name} from persistence`);
      return resolve(user);
    }
    /*
        Refactor-Me: user 가 없을 경우 예외처리 필요.
     */
  })).catch(err => Promise.reject(new Error(`Failed to Get Admin member from persistence : ${err}`)));
} /**
   *
   * Copyright 2018 KT All Rights Reserved.
   *
   */

module.exports.getAdminContext = getAdminContext;

function createAdmin(client, mspId, adminKey, adminCert) {
  return client.getUserContext(`${mspId}Admin`, true).then(user => new Promise((resolve, reject) => {
    if (user && user.isEnrolled()) {
      _logger2.default.info(`Successfully loaded ${user._name} from persistence`);
      return resolve(user);
    }

    return resolve(client.createUser({
      username: `${mspId}Admin`,
      mspid: mspId,
      cryptoContent: {
        privateKeyPEM: adminKey,
        signedCertPEM: adminCert
      }
    }));
  })).catch(err => Promise.reject(new Error(`Failed to create member from cert : ${err}`)));
}
module.exports.createAdmin = createAdmin;

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(__dirname) {

const util = __webpack_require__(6);
const path = __webpack_require__(2);
const hfc = __webpack_require__(5);

let file = 'network-config%s.yaml';

const env = process.env.TARGET_NETWORK;
if (env) {
  file = util.format(file, `-${env}`);
} else {
  file = util.format(file, '');
}

hfc.setConfigSetting('network-connection-profile-path', path.join(__dirname, 'connection-profile', file));

// eslint-disable-next-line eqeqeq
if (env == 'first_network') {
  hfc.setConfigSetting('Org1-connection-profile-path', path.join(__dirname, 'connection-profile', `org1-${env}.yaml`));
  hfc.setConfigSetting('Org2-connection-profile-path', path.join(__dirname, 'connection-profile', `org1-${env}.yaml`));
} else {
  hfc.setConfigSetting('Org1-connection-profile-path', path.join(__dirname, 'connection-profile', `org1-${env}.yaml`));
  hfc.setConfigSetting('Org2-connection-profile-path', path.join(__dirname, 'connection-profile', `org2-${env}.yaml`));
}
hfc.addConfigFile(path.join(__dirname, 'config.json'));
/* WEBPACK VAR INJECTION */}.call(exports, "server/common/hlf"))

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = routes;

var _router = __webpack_require__(23);

var _router2 = _interopRequireDefault(_router);

var _router3 = __webpack_require__(27);

var _router4 = _interopRequireDefault(_router3);

var _router5 = __webpack_require__(30);

var _router6 = _interopRequireDefault(_router5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function routes(app) {
  app.use('/api/v1/examples', _router2.default);
  app.use('/api/v1/balance', _router4.default);
  app.use('/api/v1/iras', _router6.default);
}

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = __webpack_require__(1);

var express = _interopRequireWildcard(_express);

var _controller = __webpack_require__(24);

var _controller2 = _interopRequireDefault(_controller);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.default = express.Router().post('/', _controller2.default.create).get('/', _controller2.default.all).get('/test', _controller2.default.test).get('/hello', _controller2.default.hello).get('/:id', _controller2.default.byId);

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Controller = undefined;

var _examples = __webpack_require__(25);

var _examples2 = _interopRequireDefault(_examples);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Controller {
  all(req, res) {
    _examples2.default.all().then(r => res.json(r));
  }

  test(req, res) {
    _examples2.default.test(req, res).then(r => res.json(r));
  }

  hello(req, res) {
    _examples2.default.hello(req, res).then(r => res.json(r));
  }

  byId(req, res) {
    _examples2.default.byId(req.params.id).then(r => {
      if (r) res.json(r);else res.status(404).end();
    });
  }

  create(req, res) {
    _examples2.default.create(req.body.name).then(r => res.status(201).location(`/api/v1/examples/${r.id}`).json(r));
  }
}

exports.Controller = Controller;
exports.default = new Controller();

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _logger = __webpack_require__(0);

var _logger2 = _interopRequireDefault(_logger);

var _examplesDb = __webpack_require__(26);

var _examplesDb2 = _interopRequireDefault(_examplesDb);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ExamplesService {
  all() {
    _logger2.default.info(`${this.constructor.name}.all()`);
    return _examplesDb2.default.all();
  }

  byId(id) {
    _logger2.default.debug('hello world!!!!');
    _logger2.default.info(`${this.constructor.name}.byId(${id})`);
    return _examplesDb2.default.byId(id);
  }

  create(name) {
    return _examplesDb2.default.insert(name);
  }
}

exports.default = new ExamplesService();

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
class ExamplesDatabase {
  constructor() {
    this._data = [];
    this._counter = 0;

    this.insert('example 0');
    this.insert('example 1');
  }

  all() {
    return Promise.resolve(this._data);
  }

  byId(id) {
    return Promise.resolve(this._data[id]);
  }

  insert(name) {
    const record = {
      id: this._counter,
      name
    };

    this._counter += 1;
    this._data.push(record);

    return Promise.resolve(record);
  }
}

exports.default = new ExamplesDatabase();

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = __webpack_require__(1);

var express = _interopRequireWildcard(_express);

var _controller = __webpack_require__(28);

var _controller2 = _interopRequireDefault(_controller);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.default = express.Router().get('/hello', _controller2.default.hello).get('/:id', _controller2.default.getBalance).post('/', _controller2.default.move).post('/user', _controller2.default.addUser).post('/saveUser', _controller2.default.saveUser);

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Controller = undefined;

var _balance = __webpack_require__(29);

var _balance2 = _interopRequireDefault(_balance);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Controller {
  getBalance(req, res) {
    _balance2.default.getBalance(req, res).then(r => {
      if (r) res.json(r);else res.status(404).end();
    });
  }

  hello(req, res) {
    _balance2.default.hello(req, res).then(r => {
      if (r) res.json(r);else res.status(404).end();
    });
  }

  move(req, res) {
    _balance2.default.move(req, res).then(r => {
      if (r) res.json(r);else res.status(404).end();
    });
  }

  addUser(req, res) {
    _balance2.default.addUser(req, res).then(r => {
      if (r) res.json(r);else res.status(404).end();
    });
  }

  saveUser(req, res) {
    _balance2.default.saveUser(req, res).then(r => {
      if (r) res.json(r);else res.status(404).end();
    });
  }
}
exports.Controller = Controller;
exports.default = new Controller();

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _logger = __webpack_require__(0);

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const transaction = __webpack_require__(7);

class BalanceService {
  getBalance(req, res) {
    const args = [];

    args.push(req.params.id);
    return Promise.resolve(transaction.queryChainCode(null, 'iraschannel', 'balance', args, 'query', 'admin', 'Org1'));
  }

  hello(req, res) {
    const args = [];

    args.push("test");
    return Promise.resolve(transaction.queryChainCode(null, 'iraschannel', 'balance', args, 'hello', 'admin', 'org1'));
  }

  move(req, res) {
    _logger2.default.info(`${this.constructor.name}.byId(${req})`);
    const args = [];

    args.push(req.body.from);
    args.push(req.body.to);
    args.push(req.body.amount.toString());

    return Promise.resolve(transaction.invokeChainCode(null, 'iraschannel', 'balance', 'move', args, 'admin', 'Org1'));
  }

  addUser(req, res) {
    _logger2.default.info(`${this.constructor.name}.byId(${req})`);
    const args = [];
    const peers = [];

    args.push(req.body.name);
    // args.push('b');
    args.push(req.body.balance.toString());

    peers.push('peer0.org1.iras.com');
    //peers.push('peer1.org1.example.com');
    // peers.push('peer0.org2.example.com');
    // peers.push('peer1.org2.example.com');

    _logger2.default.debug(`invoke peers:${peers}`);
    return Promise.resolve(transaction.invokeChainCode(peers, 'iraschannel', 'balance', 'add', args, 'admin', 'Org1'));
  }

  saveUser(req, res) {
    _logger2.default.info(`${this.constructor.name}.byId(${req})`);
    _logger2.default.debug(req.query.Id);
    _logger2.default.debug(req.query.Name);
    _logger2.default.debug(req.query.Age);
    _logger2.default.debug(req.query.Sex);

    const args = [];
    const peers = [];

    args.push(req.query.Id);
    args.push(req.query.Name);
    args.push(req.query.Age);
    args.push(req.query.Sex);

    // peers.push('peer0.org1.example.com');
    // peers.push('peer1.org1.example.com');
    // peers.push('peer0.org2.example.com');
    // peers.push('peer1.org2.example.com');

    _logger2.default.debug(`invoke peers:${peers}`);
    return Promise.resolve(transaction.invokeChainCode(null, req.query.Channel, 'balance', 'saveUser', args, 'admin', 'Org1'));
  }
}

exports.default = new BalanceService();

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = __webpack_require__(1);

var express = _interopRequireWildcard(_express);

var _controller = __webpack_require__(31);

var _controller2 = _interopRequireDefault(_controller);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.default = express.Router().post('/addFile', _controller2.default.addFile);

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Controller = undefined;

var _iras = __webpack_require__(32);

var _iras2 = _interopRequireDefault(_iras);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Controller {

  addFile(req, res) {
    _iras2.default.addFile(req, res).then(r => {
      if (r) res.json(r);else res.status(404).end();
    });
  }
}
exports.Controller = Controller;
exports.default = new Controller();

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _logger = __webpack_require__(0);

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const transaction = __webpack_require__(7);

class IrasService {
  addFile(req, res) {
    _logger2.default.info(`${this.constructor.name}.byId(${req})`);
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

    _logger2.default.debug(`invoke peers:${peers}`);
    Promise.resolve(transaction.invokeChainCode(peers, 'iraschannel', 'iras', 'addFile', args, 'admin', 'Org1'));
    return Promise.resolve(transaction.invokeChainCode(peers2, 'iraschannel', 'iras', 'addFile', args, 'admin', 'Org2'));

    //return Promise.resolve(transaction.invokeChainCode(peers2, 'iraschannel', 'iras',
    //'addFile', args, 'admin', 'Org2'));
  }
}

exports.default = new IrasService();

/***/ })
/******/ ]);
//# sourceMappingURL=main.map
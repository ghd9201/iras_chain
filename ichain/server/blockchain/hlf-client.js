/* eslint-disable prefer-destructuring */

const log4js = require('log4js');

const logger = log4js.getLogger('HLF');
const hfc = require('fabric-client');
const member = require('./common/member.js');

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
    return hfc.newDefaultKeyValueStore(clientConfig.credentialStore)
      .then(store => {
        client.setStateStore(store);
        this._stateStore[orgName] = store;
        return hfc.newCryptoKeyStore(clientConfig.credentialStore.cryptoStore);
      })
      .then(cryptoKeyStore => {
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

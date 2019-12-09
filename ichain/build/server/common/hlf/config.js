const util = require('util');
const path = require('path');
const hfc = require('fabric-client');

let file = 'network-config%s.yaml';

const env = process.env.TARGET_NETWORK;
if (env) { file = util.format(file, `-${env}`); } else { file = util.format(file, ''); }

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

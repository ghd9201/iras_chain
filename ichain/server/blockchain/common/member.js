/**
 *
 * Copyright 2018 KT All Rights Reserved.
 *
 */

import l from '../../common/logger';

function getAdminContext(client, mspId) {
  return client.getUserContext(`${mspId}Admin`, true)
    .then(user => new Promise((resolve, reject) => {
      if (user && user.isEnrolled()) {
        l.info(`Successfully loaded ${user._name} from persistence`);
        return resolve(user);
      }
      /*
          Refactor-Me: user 가 없을 경우 예외처리 필요.
       */
    }))
    .catch(err => Promise.reject(new Error(`Failed to Get Admin member from persistence : ${err}`)));
}
module.exports.getAdminContext = getAdminContext;

function createAdmin(client, mspId, adminKey, adminCert) {
  return client.getUserContext(`${mspId}Admin`, true)
    .then(user => new Promise((resolve, reject) => {
      if (user && user.isEnrolled()) {
        l.info(`Successfully loaded ${user._name} from persistence`);
        return resolve(user);
      }

      return resolve(client.createUser({
        username: `${mspId}Admin`,
        mspid: mspId,
        cryptoContent: {
          privateKeyPEM: adminKey,
          signedCertPEM: adminCert,
        },
      }));
    }))
    .catch(err => Promise.reject(new Error(`Failed to create member from cert : ${err}`)));
}
module.exports.createAdmin = createAdmin;

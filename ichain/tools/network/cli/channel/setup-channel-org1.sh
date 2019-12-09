#!/bin/bash

echo 'Create Channel..'

peer channel create -o orderer.iras.com:7050 -c iraschannel -f ./channel-artifacts/channel.tx \
--cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/iras.com/orderers/orderer.iras.com/msp/cacerts/ca.iras.com-cert.pem

#peer channel create -o orderer.example.com:7050 -c mychannel2 -f ./channel-artifacts/channel2.tx \
#--cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/cacerts/ca.example.com-cert.pem

#peer channel create -o orderer.example.com:7050 -c mychannel3 -f ./channel-artifacts/channel3.tx \
#--cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/cacerts/ca.example.com-cert.pem

#peer channel create -o orderer.example.com:7050 -c mychannel3 -f ./channel-artifacts/channel4.tx \
#--cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/cacerts/ca.example.com-cert.pem

#peer channel create -o orderer.example.com:7050 -c mychannel3 -f ./channel-artifacts/channel5.tx \
#--cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/cacerts/ca.example.com-cert.pem

echo 'Done'
echo 'Done'
echo 'Done'

echo 'Join Channel..'

CORE_PEER_ADDRESS=peer0.org1.iras.com:7051 peer channel join -b iraschannel.block
CORE_PEER_ADDRESS=peer1.org1.iras.com:7051 peer channel join -b iraschannel.block

CORE_PEER_ADDREE=peer0.org1.iras.com:7051 peer channel update --channelID iraschannel --file ./channel-artifacts/iraschannel.anchor.org1 --orderer orderer.iras.com:7050

#CORE_PEER_ADDRESS=peer0.org1.example.com:7051 peer channel join -b mychannel2.block
#CORE_PEER_ADDRESS=peer0.org1.example.com:7051 peer channel join -b mychannel3.block
#CORE_PEER_ADDRESS=peer0.org1.example.com:7051 peer channel join -b mychannel4.block
#CORE_PEER_ADDRESS=peer0.org1.example.com:7051 peer channel join -b mychannel5.block

echo 'Done'

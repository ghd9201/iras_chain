#!/bin/bash

export FABRIC_CFG_PATH=$PWD

#genesis.block 파일이 생성 될 channel-artifacts 디렉토리를 생성한다.
mkdir ./channel-artifacts

echo "--- iras genesis.block  ---"
#orderer genesis block: 프로필에 지정된 이름은 configtx.yaml 의 "OrdererGenesisProfile" 이다.
/home/ubuntu/go/src/github.com/hyperledger/fabric/scripts/bin/configtxgen -profile TwoOrgOrdererGenesis -outputBlock ./channel-artifacts/genesis.block

echo "--- organization iraschannel  ---"
#channel configuration transaction: 프로필에 지정된 이름은 configtx.yaml의 "ChannelProfile" 이다.
/home/ubuntu/go/src/github.com/hyperledger/fabric/scripts/bin/configtxgen -profile TwoOrgChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID iraschannel

#/home/ubuntu/go/src/github.com/hyperledger/fabric/scripts/bin/configtxgen -profile TwoOrgAnotherChannel -outputCreateChannelTx ./channel-artifacts/channel2.tx -channelID iraschannel2

#/home/ubuntu/go/src/github.com/hyperledger/fabric/scripts/bin/configtxgen -profile TwoOrgAnotherChannelB -outputCreateChannelTx ./channel-artifacts/channel3.tx -channelID iraschannel3

#/home/ubuntu/go/src/github.com/hyperledger/fabric/scripts/bin/configtxgen -profile TwoOrgAnotherChannelC -outputCreateChannelTx ./channel-artifacts/channel3.tx -channelID iraschannel4

#/home/ubuntu/go/src/github.com/hyperledger/fabric/scripts/bin/configtxgen -profile TwoOrgAnotherChannelD -outputCreateChannelTx ./channel-artifacts/channel3.tx -channelID iraschannel5


#two anchor peer transactions - one for each Peer Org.
#./bin/configtxgen -profile OneOrgChannel -outputAnchorPeersUpdate ./channel-artifacts/Org1MSPanchors.tx -channelID mychannel -asOrg Org1MSP


echo "--- organization Org1 anchor ---"
~/go/src/github.com/hyperledger/fabric-samples/bin/configtxgen -asOrg Org1MSP -channelID iraschannel -configPath . -outputAnchorPeersUpdate ./channel-artifacts/iraschannel.anchor.org1 -profile TwoOrgChannel

echo "--- organization Org2 anchor ---"
~/go/src/github.com/hyperledger/fabric-samples/bin/configtxgen -asOrg Org2MSP -channelID iraschannel -configPath . -outputAnchorPeersUpdate ./channel-artifacts/iraschannel.anchor.org2 -profile TwoOrgChannel



#!/usr/bin/env bash

#체인코드
docker exec cli1 /opt/gopath/src/github.com/hyperledger/fabric/peer/cli/chaincode/setup-chaincode-org1.sh $1 $2
docker exec cli2 /opt/gopath/src/github.com/hyperledger/fabric/peer/cli/chaincode/setup-chaincode-org2.sh $1 $2

docker exec cli1 /opt/gopath/src/github.com/hyperledger/fabric/peer/cli/chaincode/instantiate-chaincode-org1.sh $1 $2

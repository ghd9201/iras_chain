#!/usr/bin/env bash

#채널
docker exec cli1 /opt/gopath/src/github.com/hyperledger/fabric/peer/cli/channel/setup-channel-org1.sh

docker exec cli2 /opt/gopath/src/github.com/hyperledger/fabric/peer/cli/channel/setup-channel-org2.sh

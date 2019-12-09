#!/bin/bash/env bash


#	define
#
WAIT_TIME=10
TIMESTAMP=`date "+%Y%m%d_%H%M%S" -d "9 hour"`


#	display_func
#
function display_intended_instantiate()
{
	echo ' '
	echo '====================================================================='
	printf "  [ Instantiate CC]    name:%s  ver:%s  instantiate \n" $1 $2
	echo '====================================================================='
}


#	wait func
#
function waittime_4_normalization()
{
	sleep $WAIT_TIME
}


#	Main 
#
display_intended_instantiate $*

CORE_PEER_ADDRESS=peer0.org1.example.com:7051 peer chaincode instantiate -o orderer.example.com:7050 \
--tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
-C mychannel -n $1 -v $2 -c '{"Args":["init","a","200","b","200"]}' -P "OR ('Org1MSP.peer', 'Org2MSP.peer')" > '.'$TIMESTAMP'.instantiate.log' 2>&1 &

echo '  >> Done'

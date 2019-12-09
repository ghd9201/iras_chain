#!/bin/bash/env bash


#   define
#
WAIT_TIME=1
TIMESTAMP=`date "+%Y%m%d_%H%M%S" -d "9 hour"`


#   display_func
#
function display_channel_create()
{
	echo ' '
    echo '================================================================='
    echo '  [ CHANNEL CREATE]    B/C Channel Create                        '
    echo '================================================================='
}


#   wait func
#
function waittime_4_normalization()
{
    sleep $WAIT_TIME
}


#   Main
#
display_channel_create

peer channel create -o orderer.example.com:7050 -c mychannel -f ./channel-artifacts/mychannel.tx \
--tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem > '.'$TIMESTAMP'.channel_create.log' 2>&1 &

waittime_4_normalization
echo '  >> Done'

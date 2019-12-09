#!/usr/bin/env bash


#   define
#
WAIT_TIME=1
TIMESTAMP=`date "+%Y%m%d_%H%M%S" -d "9 hour"`


#   display_func
#
function display_channel_update()
{
	echo ' '
    echo '================================================================='
    echo '  [ CHANNEL UPDATE]    B/C Channel Anchor ' ${CORE_PEER_LOCALMSPID} 
    echo '================================================================='
}


#   wait func
#
function waittime_4_normalization()
{
    sleep $WAIT_TIME
}


#	Main
#
display_channel_update

peer channel update -o orderer.example.com:7050 -c mychannel -f ./channel-artifacts/${CORE_PEER_LOCALMSPID}anchors.tx  \
--tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem > '.'$TIMESTAMP'.channel_update_anchor.'$CORE_PEER_LOCALMSPID'.log' 2>&1 &

waittime_4_normalization
echo '  >> Done'

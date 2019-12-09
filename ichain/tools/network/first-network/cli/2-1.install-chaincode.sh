#!/bin/bash/env bash


#	define
#
WAIT_TIME=1
TIMESTAMP=`date "+%Y%m%d_%H%M%S" -d "9 hour"`


#	display_func
#
function display_intended_install()
{
	echo ' '
	echo '================================================================='
	printf "  [ Install C/C   ]    Peer%s / Org%s  name:%s  ver:%s\n" $1 $2 $3 $4
	echo '================================================================='
}


#	wait func
#
function waittime_4_normalization()
{
	sleep $WAIT_TIME
}


#	Main 
#
display_intended_install $*

CHAINCODE_DIR=github.com/hyperledger/fabric/examples/chaincode/go/
CORE_PEER_ADDRESS=peer$1.org$2.example.com:7051 peer chaincode install -n $3 -v $4 -p $CHAINCODE_DIR/$3 > '.'$TIMESTAMP'.org'$2'.peer'$1'.install.log' 2>&1 &

waittime_4_normalization
echo '  >> Done'

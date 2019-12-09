#!/bin/bash


#	define
#
WAIT_TIME=10
TIMESTAMP=`date "+%Y%m%d_%H%M%S" -d "9 hour"`


#	display_func
#
function display_default_install()
{
	echo '================================================================='
	echo '  [Default Setting]    Balance Chaincode Install Version(0.1)!!  '
	echo '================================================================='
}

function display_intended_install()
{
	echo '================================================================='
	printf "  [ Intended Case ] %10s Chaincode Install Version(%s)!!\n" $1 $2
	echo '================================================================='
}

function display_default_instantiate()
{
	echo ' '
	echo '  Instantiate ChainCode'
	echo '====================================================================='
	echo '  [Default Setting]    Balance Chaincode Instantiate Version(0.1)!!  '
	echo '====================================================================='
}

function display_intended_instantiate()
{
	echo ' '
	echo '  Instantiate ChainCode'
	echo '====================================================================='
	printf "  [ Intended Case ] %10s Chaincode Instantiate Version(%s)!!\n" $1 $2
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
echo ' '
echo '  Install ChainCode'

if [ -z $1 ]; then
	#
	display_default_install

	CHAINCODE_DIR=github.com/hyperledger/fabric/examples/chaincode/go/
	CORE_PEER_ADDRESS=peer0.org2.example.com:7051 peer chaincode install -n balance -v 0.1 -p $CHAINCODE_DIR/balance_cc > '.'$TIMESTAMP'.org2.peer0.install.log' 2>&1 &

	CHAINCODE_DIR=github.com/hyperledger/fabric/examples/chaincode/go/
	CORE_PEER_ADDRESS=peer1.org2.example.com:7051 peer chaincode install -n balance -v 0.1 -p $CHAINCODE_DIR/balance_cc > '.'$TIMESTAMP'.org2.peer1.install.log' 2>&1 &
	echo '  >> Done'

	#
	#waittime_4_normalization
	#display_default_instantiate

	#CORE_PEER_ADDRESS=peer0.org2.example.com:7051 peer chaincode instantiate -o orderer.example.com:7050 \
	#--tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
	#-C mychannel -n balance -v 0.1 -c '{"Args":["init","a","200","b","200"]}' -P 'OR ("Org1MSP.peer", "Org2MSP.peer")' > '.'$TIMESTAMP'.org2.instantiate.log' 2>&1 &

	#echo '  >> Done'
else
	#
	display_intended_install $*

	CHAINCODE_DIR=github.com/hyperledger/fabric/examples/chaincode/go/
	CORE_PEER_ADDRESS=peer0.org2.example.com:7051 peer chaincode install -n $1 -v $2 -p $CHAINCODE_DIR/$1_cc > '.'$TIMESTAMP'.org2.peer0.install.log' 2>&1 &

	CHAINCODE_DIR=github.com/hyperledger/fabric/examples/chaincode/go/
	CORE_PEER_ADDRESS=peer1.org2.example.com:7051 peer chaincode install -n $1 -v $2 -p $CHAINCODE_DIR/$1_cc > '.'$TIMESTAMP'.org2.peer1.install.log' 2>&1 &
	echo '  >> Done'

	#
	#waittime_4_normalization
	#display_intended_instantiate $*

	#CORE_PEER_ADDRESS=peer0.org2.example.com:7051 peer chaincode instantiate -o orderer.example.com:7050 \
	#--tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
	#-C mychannel -n $1 -v $2 -c '{"Args":["init","a","200","b","200"]}' -P 'OR ("Org1MSP.peer", "Org2MSP.peer")' > '.'$TIMESTAMP'.org2.instantiate.log' 2>&1 &

	#echo '  >> Done'
fi

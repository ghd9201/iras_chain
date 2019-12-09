#!/usr/bin/env bash


#   define
#
WAIT_TIME=1
TIMESTAMP=`date "+%Y%m%d_%H%M%S" -d "9 hour"`


#
function display_channel_join()
{
    echo ' '
    echo '================================================================='
    echo '  [ CHANNEL JOIN  ]    B/C Channel' peer$1.org$2.example.com 
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
display_channel_join $*

CORE_PEER_ADDRESS=peer$1.org$2.example.com:7051 peer channel join -b mychannel.block > '.'$TIMESTAMP'.channel_join.peer'$1'.org'$2'.log' 2>&1 &

waittime_4_normalization
echo '  >> Done'

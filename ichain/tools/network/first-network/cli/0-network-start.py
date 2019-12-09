#!/usr/bin/python

import os
import sys
import subprocess



#   define
#
LINE_END     ="================================================================="
LINE_NET_DOWN="  [ Network Down  ]    Blockchain Network Containers are Down.   "
LINE_NET_UP  ="  [ Network Up    ]    Blockchain Network Containers are Up      "



#   display func
#
def display_network_down():
    os.system('clear')
    print("")
    print(LINE_END)
    print(LINE_NET_DOWN)
    print(LINE_END)
    print("")

def display_network_up():
    os.system('clear')
    print("")
    print(LINE_END)
    print(LINE_NET_UP)
    print(LINE_END)
    print("")



#   func
#
def network_down_cmd():
    network_down_cmd = "docker-compose -f docker-compose.yaml down"
    cmd_result = subprocess.call(network_down_cmd, stdin=None, stdout=None, stderr=subprocess.STDOUT, shell=True)
    return cmd_result

def network_up_cmd():
    network_up_cmd = "docker-compose -f docker-compose.yaml up -d"
    cmd_result = subprocess.call(network_up_cmd, stdin=None, stdout=None, stderr=subprocess.STDOUT, shell=True)
    return cmd_result

def wait_time_cmd():
    wait_time_cmd = "sleep 5"
    cmd_result = subprocess.call(wait_time_cmd, stdin=None, stdout=None, stderr=subprocess.STDOUT, shell=True)
    return cmd_result


def main():

    display_network_down()    
    result = network_down_cmd()
    if 0 != result:
        sys.exit(-1)

    display_network_up()
    result = network_up_cmd()
    if 0 != result:
        sys.exit(-1)

    wait_time_cmd

if __name__ == '__main__':
        main()

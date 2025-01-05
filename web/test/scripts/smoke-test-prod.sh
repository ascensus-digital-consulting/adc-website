#! /bin/bash
DOMAIN=$1
export TERM=xterm-256color
source ./adclib.sh

printResult "https://$DOMAIN" 200
printResult "https://$DOMAIN/metadata" 200

exit 0
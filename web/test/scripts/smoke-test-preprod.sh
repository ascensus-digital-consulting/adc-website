#! /bin/bash
DOMAIN=$1
export TERM=xterm-256color
source ./adclib.sh

printResult "https://$DOMAIN" 401
printResult "https://christopher:bingo!@$DOMAIN" 200
printResult "https://$DOMAIN/metadata" 401
printResult "https://christopher:bingo!@$DOMAIN/metadata" 200

exit 0
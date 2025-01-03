#! /bin/bash
url=$1
export TERM=xterm-256color

tput setaf 3
echo "Initiating smoke test against $url"
http_response=$(curl -o /dev/null --silent --write-out '%{http_code}\n' $url)
tput setaf 3
echo "Smoke test against $url complete"

if [ $http_response -eq 200 ]; then
    tput setaf 2
    echo "HTTP response code $http_response received"
    tput setaf 2
    echo "Smoke test PASSED!"
    exit 0
else
    tput setaf 1
    echo "HTTP response code $http_response received"
    tput setaf 1
    echo "Smoke test FAILED!"
    tput setaf 1
    echo "Expected HTTP status 200, received HTTP status code $http_code"
    exit 1
fi

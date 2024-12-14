#! /bin/bash
url=$1
echo "Initiating smoke test against $url"
http_response=$(curl -o /dev/null --silent --write-out '%{http_code}\n' $url)
echo "HTTP response code $url received"
if [ $http_response -eq 200 ]; then
    tput setaf 2
    echo "Smoke test PASSED!"
    echo "Exit code 0"
    exit 0
else
    tput setaf 1
    echo "Smoke test FAILED!"
    echo "Exit code 1"
    exit 1
fi

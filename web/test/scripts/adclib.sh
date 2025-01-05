#! /bin/bash
printResult() {
  URL=$1
  HTTP_CODE_EXPECTED=$2

  tput setaf 3
  echo "Initiating smoke test against $URL"
  HTTP_CODE_ACTUAL=$(curl -o /dev/null --silent --write-out '%{http_code}\n' $URL)
  tput setaf 3
  echo "Smoke test against $url complete"

  if [ $HTTP_CODE_ACTUAL -eq $HTTP_CODE_EXPECTED ]; then
    tput setaf 2
    echo "HTTP response code $HTTP_CODE_ACTUAL received from $URL"
    tput setaf 2
    echo "Smoke test PASSED!"
  else
    tput setaf 1
    echo "HTTP response code $HTTP_CODE_ACTUAL received fromn $URL"
    tput setaf 1
    echo "Smoke test FAILED!"
    tput setaf 1
    echo "Expected HTTP status $HTTP_CODE_EXPECTED, received HTTP status code $HTTP_CODE_ACTUAL"
    exit 1
  fi
}
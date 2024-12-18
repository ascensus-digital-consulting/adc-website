#!/bin/sh
clear

WORKFLOW_TEST_FILE=workflow-test.html
ID=$(date +%s)
TEST_BRANCH_NAME=test-branch-$ID
NEW_CONTENT="<!DOCTYPE html><html lang=\"en\"><head><title>Workflow Test File</title></head><body>Test id:<strong>$ID</strong></body></html>"

git checkout main
git pull origin main
git checkout -b $TEST_BRANCH_NAME

echo "$NEW_CONTENT" > $WORKFLOW_TEST_FILE

git add $WORKFLOW_TEST_FILE
git commit -m "update sample file to test GitHub workflow, id: $ID"
git push
git checkout main
git branch -D $TEST_BRANCH_NAME

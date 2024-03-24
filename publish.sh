#!/bin/bash

sed -i'' -e "s|\"version\": \"%VERSION%\",|\"version\": \"$1\",|" "$(pwd)/package.json"
echo "... Publishing version $1 ..."
npm publish
sed -i'' -e "s|\"version\": \"$1\",|\"version\": \"%VERSION%\",|" "$(pwd)/package.json"

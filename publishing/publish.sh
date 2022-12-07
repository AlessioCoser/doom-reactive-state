#!/bin/bash

cp "$(pwd)/publishing/package.json" "$(pwd)/dist/"
sed -i'' -e "s|%VERSION%|$1|" "$(pwd)/dist/package.json"
cd $(pwd)/dist/
echo "... Publishing version $1 ..."
npm publish

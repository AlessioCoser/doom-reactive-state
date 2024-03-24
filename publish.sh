#!/bin/bash

cp "$(pwd)/package.json" "$(pwd)/dist/"
cp "$(pwd)/.npmignore" "$(pwd)/dist/"
cp "$(pwd)/readme.md" "$(pwd)/dist/"
sed -i'' -e "s|%VERSION%|$1|" "$(pwd)/dist/package.json"
cd $(pwd)/dist/
echo "... Publishing version $1 ..."
npm publish
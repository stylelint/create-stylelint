#! /bin/sh

rm -f .stylelintrc.json
rm -f package.json
rm -f package-lock.json
rm -rf node_modules
cp clean-package.json package.json

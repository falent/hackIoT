#!/bin/sh

sleep 10s
cd /skill/dist/app/src/
npm install
bst lambda proxy /skill/dist/app/src/index.js
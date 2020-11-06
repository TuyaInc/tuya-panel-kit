#!/bin/bash
git config --global user.name "tuyafe"
git config --global user.email "tuyafe@tuya.com"
git fetch origin
git checkout TYNativeApi
git branch
git checkout master -- src/TYNativeApi.js
git remote add github https://github.com/TuyaInc/tuya-panel-kit.git
git push github -f
git remote rm github
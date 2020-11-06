#!/bin/bash
git checkout master -- src/TYNativeApi.js

git remote add github https://github.com/TuyaInc/tuya-panel-kit.git

git push github -f

git remote rm github
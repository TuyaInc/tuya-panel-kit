const fs = require('fs');
const path = require('path');
const { exec } = require('./utils');

const ENV = process.env;

const changelogPath = path.resolve(process.cwd(), 'CHANGELOG.md');
const allChangelog = fs.readFileSync(changelogPath, { encoding: 'utf-8' });

const changelog = allChangelog
  .match(/<a [\s\S]+?<a.+/gm)[0]
  .replace(/<a.+/gm, '')
  .replace(/^\n/gm, '');

exec(`curl 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${ENV.WECHAT_ROBOT_KEY}' \
   -H 'Content-Type: application/json' \
   -d '
   {
     "msgtype": "markdown",
     "markdown": {
       "content": "# @tuya-rn/tuya-native-kit\n\n${changelog}"
      }
    }
'
`);

console.log('\nnotify: Done!');

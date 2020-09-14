/**
 * 通过企业微信系统通知发送通知
 */
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { exec } = require('./utils');

const ENV = process.env;

const TYWXURL =
  'http://basic.tuya-inc.com:7007/qywx.do?do=message&opt=sendMessage&type=email&agentId=1000006';

const changelogPath = path.resolve(process.cwd(), 'CHANGELOG.md');
const allChangelog = fs.readFileSync(changelogPath, { encoding: 'utf-8' });

const changelog = allChangelog.match(/<a [\s\S]+?<a.+/gm)[0].replace(/<a.+/gm, '');

const currentBranch = exec('git rev-parse --abbrev-ref HEAD').toString().replace(/\s/g, '');

const content = `[tuya-native-kit 发布🚀🚀🚀]

${changelog}
详情见: https://code.registry.wgine.com/TuyaRN/tuya-native-kit/blob/${currentBranch}/CHANGELOG.md
`;

const notifyWX = async () => {
  const res = await fetch('https://panel-dashboard-server.fast-inside.wgine.com:7799/allHybridUser', {
    method: 'get',
  }).then(res => res.json());
  const users = res.result.data;
  await Promise.all(
    users.map(user =>
      fetch(`${TYWXURL}&message=${encodeURIComponent(content)}&toUser=${user.email}`, {
        method: 'get',
        headers: {
          'Tuya-Intranet': 'Tuya@intranet@2018',
          'Content-Type': 'application/json',
        },
      })
    )
  );
  console.log('\nnotify: Done!');
};

notifyWX();

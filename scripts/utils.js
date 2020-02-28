const { execSync } = require('child_process');

const exec = (cmd, ...args) => {
  console.log(`\n${cmd}\n`);
  return execSync(cmd, ...args);
};

module.exports = {
  exec,
};

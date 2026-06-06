const fs = require('fs');
const path = require('path');
const { start } = require('./server');

module.exports = async () => {
  // Fresh coverage output for this run.
  const nycDir = path.resolve(__dirname, '..', '.nyc_output');
  fs.rmSync(nycDir, { recursive: true, force: true });
  fs.mkdirSync(nycDir, { recursive: true });

  globalThis.__testServer = await start();
};

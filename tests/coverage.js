/**
 * Node-side accumulator that merges per-test service-worker coverage and
 * writes the union to .nyc_output for `nyc report` to consume.
 */
const fs = require('fs');
const path = require('path');
const libCoverage = require('istanbul-lib-coverage');

const map = libCoverage.createCoverageMap({});

function add(data) {
  if (data && Object.keys(data).length) {
    map.merge(data);
  }
}

function flush() {
  const dir = path.resolve(__dirname, '..', '.nyc_output');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'coverage.json'), JSON.stringify(map.toJSON()));
}

module.exports = { add, flush };

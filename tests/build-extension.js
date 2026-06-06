/**
 * Builds an instrumented copy of the extension under dist-test/.
 *
 * The four service-worker logic files are instrumented with istanbul so that
 * e2e tests can read `self.__coverage__` from the running service worker.
 *
 * injected.js and service_worker.js are copied verbatim:
 *  - injected.js is serialized into page contexts via executeScript, so it must
 *    stay free of istanbul counters (which reference the SW scope).
 *  - service_worker.js only calls importScripts and needs no coverage.
 *
 * Istanbul is configured with coverageGlobalScopeFunc:false so the generated
 * code uses `globalThis` instead of `new Function("return this")()`, which the
 * MV3 service-worker CSP would otherwise reject.
 */
const fs = require('fs');
const path = require('path');
const { createInstrumenter } = require('istanbul-lib-instrument');

const SRC = path.resolve(__dirname, '..', 'src');
const OUT = path.resolve(__dirname, '..', 'dist-test');

const INSTRUMENT = ['app.js', 'ui.js', 'browser_init.js', 'page_injector.js'];
const COPY_JS = ['injected.js', 'content_start.js', 'service_worker.js'];
const ASSETS = ['manifest.json', 'icons'];

const instrumenter = createInstrumenter({
  esModules: false,
  compact: false,
  coverageGlobalScope: 'globalThis',
  coverageGlobalScopeFunc: false,
  produceSourceMap: false
});

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

for (const file of INSTRUMENT) {
  const srcPath = path.join(SRC, file);
  const code = fs.readFileSync(srcPath, 'utf8');
  // Use the original source path so coverage maps back to src/.
  const instrumented = instrumenter.instrumentSync(code, srcPath);
  fs.writeFileSync(path.join(OUT, file), instrumented);
}

for (const file of COPY_JS) {
  fs.copyFileSync(path.join(SRC, file), path.join(OUT, file));
}

for (const asset of ASSETS) {
  fs.cpSync(path.join(SRC, asset), path.join(OUT, asset), { recursive: true });
}

console.log('Built instrumented extension at', OUT);

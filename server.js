/* eslint-disable @typescript-eslint/no-require-imports */
const { createServer } = require("node:http");
const next = require("next");

const passenger = globalThis.PhusionPassenger;
if (passenger) {
  passenger.configure({ autoInstall: false });
}

const listenTarget = passenger ? "passenger" : Number(process.env.PORT || 3000);
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(listenTarget, () => {
    console.log(`Payment app is listening on ${listenTarget}`);
  });
});

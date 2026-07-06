/* eslint-disable @typescript-eslint/no-require-imports */
const { createServer } = require("node:http");
const next = require("next");

const port = Number(process.env.PORT || 3000);
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, () => {
    console.log(`Payment app is listening on port ${port}`);
  });
});

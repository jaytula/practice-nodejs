const http = require("http");
const routes = require('./routes');

const server = http.createServer((req, res) => {
  return routes(req, res);
});

server.listen(8081, () => {
  console.log("Listening");
});

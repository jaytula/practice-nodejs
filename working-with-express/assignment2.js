const express = require("express");

const app = express();

app.use("/users", (req, res, next) => {
  res.send("/users middleware");
});

app.use("/", (req, res, next) => {
  res.send("/ middleware");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});

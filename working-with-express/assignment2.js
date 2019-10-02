const express = require("express");

const app = express();

// app.use((req, res, next) => {
//     console.log('middleware 1');
//     next();
// });

// app.use((req, res, next) => {
//     console.log('middleware 2');
//     next();
// })

// app.use((req, res, next) => {
//     res.send('hi there');
// })

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

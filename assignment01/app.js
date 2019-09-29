const http = require("http");
const PORT = 3000;

const USERS = ["Michael", "Rebecca", "Alex", "Bobby", "Niki"];

const app = http.createServer((req, res) => {
  const { url, method } = req;

  if (url === "/") {
    res.setHeader("Content-Type", "text/html");
    res.write("<html>");
    res.write("<body>");
    res.write("<h1>Greetings!</h1>");
    res.write(
      "<form method='POST' action='/create-user'><input type='text' name='username'><button type='submit'>Create User</button></form>"
    );
    res.write("</body>");
    res.write("</html>");
    return res.end();
  }

  if (url === "/users") {
    res.setHeader("Content-Type", "text/html");
    res.write("<html>");
    res.write("<ul>");
    USERS.forEach(user => {
      res.write(`<li>${user}</li>`);
    });
    res.write("</ul>");
    res.write("</html>");
    return res.end();
  }

  if (url === "/create-user" && method === "POST") {
    const data = [];
    req.on("data", chunk => {
      data.push(chunk);
    });

    req.on("end", () => {
      const parsedData = Buffer.concat(data).toString();
      const username = parsedData.split('=')[1]
      res.write(`Data received: ${username}`);
      USERS.push(username);
      return res.end();
    });
  } else {
    res.write("Not found");
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});

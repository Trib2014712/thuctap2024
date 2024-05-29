const express = require("express");
const path = require("path");
require('dotenv').config();
const routes = require("./routes/user.route");

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Sử dụng router cho mỗi endpoint
app.use("/", routes);
app.use("/register", routes);
app.use("/login", routes);

// Chuyển hướng người dùng đến trang index khi đăng nhập thành công
app.post("/login", (req, res, next) => {
  routes.post("/login", req, res, () => {
    res.redirect('/index');
  });
});

app.listen(1337, () => console.log("Running on http://localhost:1337"));

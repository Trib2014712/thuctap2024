const express = require("express");
const { body } = require("express-validator");
const controller = require("../controller/user.controller");

const router = express.Router();

router.get("/register", (req, res) => {
  res.render("register", { errors: [] });
});

router.post("/register", 
  [
    body("name").notEmpty().withMessage("Tên là bắt buộc"),
    body("email").isEmail().withMessage("Email không hợp lệ"),
    body("password").isLength({ min: 6 }).withMessage("Mật khẩu phải có độ dài ít nhất 6 ký tự")
  ],
  controller.register
);

router.get("/login", (req, res) => {
  res.render("login", { errors: [] });
});

router.post("/login", 
  [
    body("email").isEmail().withMessage("Email không hợp lệ"),
    body("password").notEmpty().withMessage("Cần có mật khẩu")
  ],
  controller.login,
  (req, res) => {
    res.redirect('/index'); // Chuyển hướng đến trang index sau khi đăng nhập thành công
  }
);

module.exports = router;

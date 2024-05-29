// controller.js
const { google } = require("googleapis");
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");
require('dotenv').config();

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Trả về mã JavaScript để hiển thị thông báo alert
    return res.send(`<script>alert('${errors.array()[0].msg}')</script>`);
  }

  // Xử lý đăng ký

  const { name, email, password } = req.body;

  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

  try {
    const client = await auth.getClient();
    const googleSheets = google.sheets({ version: "v4", auth: client });
    const spreadsheetId = process.env.SPREADSHEET_ID;

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "Dangky!A:C",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[name, email, password]],
      },
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    let info = await transporter.sendMail({
      from: `"Hữu Trí" <${process.env.EMAIL}>`,
      to: email,
      subject: "Email Verification",
      text: `Hello ${name}, please verify your email by clicking the link: http://localhost:1337/verify?email=${email}`,
    });

    console.log("Message sent: %s", info.messageId);

    res.send('Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản của bạn.');
  } catch (error) {
    console.error("Lỗi khi thêm dữ liệu vào Google Sheets hoặc gửi email:", error);
    res.status(500).send("Đã xảy ra lỗi khi gửi đăng ký của bạn.");
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Trả về mã JavaScript để hiển thị thông báo alert
    return res.send(`<script>alert('${errors.array()[0].msg}')</script>`);
  }

  const { email, password } = req.body;

  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

  try {
    const client = await auth.getClient();
    const googleSheets = google.sheets({ version: "v4", auth: client });
    const spreadsheetId = process.env.SPREADSHEET_ID;

    const getRows = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: "Dangky!A:C",
    });

    const rows = getRows.data.values;
    const user = rows.find(row => row[1] === email && row[2] === password);

    if (!user) {
      return res.status(401).send(`<script>alert('Email hoặc mật khẩu không hợp lệ')</script>`);
    }

    // Chuyển hướng đến trang index sau khi đăng nhập thành công
    res.redirect('/index');

    // Nếu muốn hiển thị thông báo alert trước khi chuyển hướng
    // res.send(`<script>alert('Đăng nhập thành công!'); window.location.href = '/index';</script>`);
  } catch (error) {
    console.error("Lỗi khi truy cập Google Sheets hoặc gửi email:", error);
    res.status(500).send("Đã xảy ra lỗi khi xử lý đăng nhập của bạn.");
  }
};

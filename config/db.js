const mysql = require("mysql2/promise");

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Vinh@11032006", // Mật khẩu bạn vừa cập nhật thành công trong MySQL Workbench
    database: "newsdb"
});

module.exports = db;
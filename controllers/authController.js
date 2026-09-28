const userModel = require("../models/userModel");

function showLogin(req, res) {
  res.render("auth/login", { error: null });
}

async function login(req, res) {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const user = await userModel.findUserByUsernameAndPassword(
      username,
      password
    );

    if (!user) {
      return res.render("auth/login", {
        error: "Sai username hoặc password",
      });
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      fullname: user.fullname,
    };

    res.redirect("/news");
  } catch (error) {
    console.log(error);
    res.send("Lỗi khi đăng nhập");
  }
}

function logout(req, res) {
  req.session.destroy(() => {
    res.redirect("/");
  });
}

module.exports = {
  showLogin,
  login,
  logout,
};
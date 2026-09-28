const express = require("express");
const path = require("path");
const session = require("express-session");

const postRoutes = require("./routes/postRoutes");
const authRoutes = require("./routes/authRoutes");
const { usesession } = require("./middlewares/authMiddleware");

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(usesession);

app.get("/", (req, res) => {
  res.render("home");
});

app.use("/", authRoutes);
app.use("/news", postRoutes);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
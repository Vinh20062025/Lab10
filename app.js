const express = require("express");
const path = require("path");
const session = require("express-session");
const db = require("./config/db");

const app = express();
const port = 3000;

// Cấu hình View Engine EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware đọc dữ liệu form & file tĩnh CSS
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Cấu hình Session
app.use(session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: false
}));

// Middleware Logger
function logger(req, res, next) {
    console.log(req.method, req.url);
    next();
}
app.use(logger);

// Middleware truyền thông tin user tới tất cả file EJS
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Middleware kiểm tra đăng nhập
function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    next();
}

// 1. TRANG CHỦ
app.get("/", (req, res) => {
    res.render("home");
});

// 2. DĂNG NHẬP / ĐĂNG XUẤT
app.get("/login", (req, res) => {
    res.render("login", { error: null });
});

app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const [users] = await db.query(
            "SELECT * FROM users WHERE username = ? AND password = ?",
            [username, password]
        );
        if (users.length === 0) {
            return res.render("login", { error: "Sai username hoặc password" });
        }
        req.session.user = { username: username };
        return res.redirect("/news");
    } catch (error) {
        console.log(error);
        res.send("Lỗi khi đăng nhập");
    }
});

app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

// 3. TÌM KIẾM BÀI VIẾT (Lưu ý: Đặt trước route /news/:id)
app.get("/news/search", async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const [posts] = await db.query(
            "SELECT * FROM posts WHERE title LIKE ? OR description LIKE ? ORDER BY id DESC",
            [`%${keyword}%`, `%${keyword}%`]
        );
        res.render("news-list", { posts });
    } catch (error) {
        console.log(error);
        res.send("Lỗi khi tìm kiếm bài viết");
    }
});

// 4. THÊM BÀI VIẾT (Lưu ý: Đặt trước route /news/:id)
app.get("/news/add", requireLogin, (req, res) => {
    res.render("add-post");
});

app.post("/news/add", requireLogin, async (req, res) => {
    try {
        const { title, description } = req.body;
        await db.query(
            "INSERT INTO posts(title, description) VALUES (?, ?)",
            [title, description]
        );
        res.redirect("/news");
    } catch (error) {
        console.log(error);
        res.send("Lỗi khi thêm bài viết");
    }
});

// 5. SỬA BÀI VIẾT (Lưu ý: Đặt trước route /news/:id)
app.get("/news/:id/edit", requireLogin, async (req, res) => {
    try {
        const id = req.params.id;
        const [rows] = await db.query("SELECT * FROM posts WHERE id = ?", [id]);
        if (rows.length === 0) {
            return res.status(404).send("Không tìm thấy bài viết");
        }
        res.render("edit-post", { post: rows[0] });
    } catch (error) {
        console.log(error);
        res.send("Lỗi khi mở form sửa");
    }
});

app.post("/news/:id/edit", requireLogin, async (req, res) => {
    try {
        const id = req.params.id;
        const { title, description } = req.body;
        await db.query(
            "UPDATE posts SET title = ?, description = ? WHERE id = ?",
            [title, description, id]
        );
        res.redirect("/news");
    } catch (error) {
        console.log(error);
        res.send("Lỗi khi cập nhật bài viết");
    }
});

// 6. XÓA BÀI VIẾT
app.post("/news/:id/delete", requireLogin, async (req, res) => {
    try {
        const id = req.params.id;
        await db.query("DELETE FROM posts WHERE id = ?", [id]);
        res.redirect("/news");
    } catch (error) {
        console.log(error);
        res.send("Lỗi khi xóa bài viết");
    }
});

// 7. DANH SÁCH BÀI VIẾT
app.get("/news", async (req, res) => {
    try {
        const [posts] = await db.query("SELECT * FROM posts ORDER BY id DESC");
        res.render("news-list", { posts });
    } catch (error) {
        console.log(error);
        res.send("Lỗi khi lấy danh sách bài viết");
    }
});

// 8. CHI TIẾT BÀI VIẾT
app.get("/news/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const [rows] = await db.query("SELECT * FROM posts WHERE id = ?", [id]);
        if (rows.length === 0) {
            return res.status(404).send("Không tìm thấy bài viết");
        }
        res.render("news-detail", { post: rows[0] });
    } catch (error) {
        console.log(error);
        res.send("Lỗi khi xem chi tiết bài viết");
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
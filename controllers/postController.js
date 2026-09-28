const postModel = require("../models/postModel");

async function index(req, res) {
  try {
    const posts = await postModel.getAllPosts();
    res.render("posts/index", { posts });
  } catch (error) {
    console.log(error);
    res.send("Lỗi khi lấy danh sách bài viết");
  }
}

async function show(req, res) {
  try {
    const id = req.params.id;
    const post = await postModel.getPostById(id);
    if (!post) {
      return res.status(404).send("Không tìm thấy bài viết");
    }
    res.render("posts/show", { post });
  } catch (error) {
    console.log(error);
    res.send("Lỗi khi xem chi tiết bài viết");
  }
}

async function search(req, res) {
  try {
    const keyword = req.query.keyword || "";
    const posts = await postModel.searchPosts(keyword);
    res.render("posts/index", { posts });
  } catch (error) {
    console.log(error);
    res.send("Lỗi khi tìm kiếm bài viết");
  }
}

function create(req, res) {
  res.render("posts/create");
}

async function store(req, res) {
  try {
    const title = req.body.title;
    const description = req.body.description;
    await postModel.createPost(title, description);
    res.redirect("/news");
  } catch (error) {
    console.log(error);
    res.send("Lỗi khi thêm bài viết");
  }
}

async function edit(req, res) {
  try {
    const id = req.params.id;
    const post = await postModel.getPostById(id);
    if (!post) {
      return res.status(404).send("Không tìm thấy bài viết");
    }
    res.render("posts/edit", { post });
  } catch (error) {
    console.log(error);
    res.send("Lỗi khi mở form sửa");
  }
}

async function update(req, res) {
  try {
    const id = req.params.id;
    const title = req.body.title;
    const description = req.body.description;
    await postModel.updatePost(id, title, description);
    res.redirect("/news");
  } catch (error) {
    console.log(error);
    res.send("Lỗi khi cập nhật bài viết");
  }
}

async function destroy(req, res) {
  try {
    const id = req.params.id;
    await postModel.deletePost(id);
    res.redirect("/news");
  } catch (error) {
    console.log(error);
    res.send("Lỗi khi xóa bài viết");
  }
}

module.exports = {
  index,
  show,
  search,
  create,
  store,
  edit,
  update,
  destroy,
};
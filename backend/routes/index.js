const express = require("express");
const forumRoutes = require("../routes/forum.routes");
const commentRoutes = require("../routes/comment.routes");
const postRoutes = require("../routes/post.routes");
const router = express.Router();

const defaultRoutes = [
  {
    path: "/forum",
    route: forumRoutes,
  },
  {
    path: "/comment",
    route: commentRoutes,
  },
  {
    path: "/post",
    route: postRoutes,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;

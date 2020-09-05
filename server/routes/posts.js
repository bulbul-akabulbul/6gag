const express = require("express");
const router = express.Router();
const db = require("../database");
const schemas = require("../schemas");
const { requiresAuthentication } = require("../passport");
const createError = require("http-errors");

// GET all posts
router.get("/", (req, res, next) => {
  db.getAllPosts()
    .then((posts) => {
      res.json(posts);
    })
    .catch((error) => next(createError(500, error)));
});

// GET post by id
router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).send(`Invalid ID ${req.params.id}`);
  }
  db.getPostById(id)
    .then((post) => res.json(post))
    .catch((error) => next(createError(500, error)));
});

// POST create new post
router.post("/", requiresAuthentication(), (req, res, next) => {
  const post = { ...req.body, userId: req.user.id };

  // Validate schema of post object.
  const { error } = schemas.validatePost(post);
  if (error) return res.status(400).send(error.message);

  db.addNewPost(post)
    .then((newId) => res.status(201).send(`Post added with ID: ${newId}`))
    .catch((err) => next(createError(500, err)));
});

// PUT update post description.
router.put(
  "/:id",
  requiresAuthentication(true, (req) => parseInt(req.params.id)),
  (req, res, next) => {
    const id = parseInt(req.params.id);
    const newDescription = req.params.description;

    db.updatePostDescription(id, newDescription)
      .then((newId) => res.send(`Post updated with ID: ${newId}`))
      .catch((error) => next(createError(500, err)));
  }
);

// DELETE post by id
router.delete(
  "/:id",
  requiresAuthentication(true, async (req) => {
    return (await db.getPostById(parseInt(req.params.id))).userId;
  }),
  (req, res, next) => {
    const id = parseInt(req.params.id);
    db.getPostById(id)
      .then((post) => {
        if (req.user.isAdmin || req.user.id === post.userId)
          db.deletePost(id)
            .then((_) => res.end(`Post deleted with ID: ${id}`))
            .catch((err) => next(createError(500, err)));
        else return res.status(403).send("Forbidden.");
      })
      .catch((err) => next(createError(500, err)));
  }
);

module.exports = router;

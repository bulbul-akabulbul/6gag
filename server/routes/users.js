const express = require("express");
const router = express.Router();
const db = require("../database");
const schemas = require("../schemas");
const { requiresAuthentication } = require("../passport");
const createError = require("http-errors");

/* GET all users listing. */
router.get("/", (req, res, next) => {
  db.getAllUsers()
    .then((result) => res.status(200).json(result))
    .catch((err) => {
      next(createError(500, err));
    });
});

// GET user by id
router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    res.status(400).send(`Invalid ID ${req.params.id}`);
    return;
  }

  db.getUserById(id)
    .then((result) => {
      if (result) return res.status(200).json(result);
      return res.status(400).send(`No user found with ID ${id}`);
    })
    .catch((err) => {
      next(createError(500, err));
    });
});

// POST create new user
router.post("/", (req, res, next) => {
  console.log(req.body);
  const user = req.body;
  user["roleId"] = -1; // Ignored.

  // Validate schema of user object.
  const { error } = schemas.validateUser(user);
  if (error) return res.status(400).send(error.message);

  db.getAllUsers()
    .then((users) => {
      if (users.find((u) => u.username === user.username))
        return res.status(400).send("A user with that username already exists.");
      else if (users.find((u) => u.email === user.email))
        return res.status(400).send("A user with that email already exists.");

      db.addNewUser(user)
        .then((newId) => res.status(201).send(`User added with ID: ${newId}`))
        .catch((err) => next(createError(500, err)));
    })
    .catch((err) => next(createError(500, err)));
});

// PUT update user by id
router.put(
  "/:id",
  requiresAuthentication(true, (req) => parseInt(req.params.id)),
  (req, res, next) => {
    const id = parseInt(req.params.id);
    // Anything less powerful than admin

    const user = { ...req.body, id: id };

    db.updateUser(user)
      .then((result) => {
        if (result.length === 0) return res.status(400).send(`No user with id ${id}`);
        return res.status(200).send(`User modified with ID: ${result[0].id}`);
      })
      .catch((err) => next(createError(500, err)));
  }
);

// DELETE user by id
router.delete("/", requiresAuthentication(), async (req, res) => {
  const id = parseInt(req.user.id);
  db.deleteUser(id)
    .then((_) => res.status(200).send(`User deleted with ID: ${id}`))
    .catch((err) => createError(500, err));
});

module.exports = router;

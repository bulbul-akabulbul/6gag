const express = require("express");
const router = express.Router();
const db = require("../database");
const { response, request } = require("../app");
const schemas = require("../schemas");
const Joi = require("joi");
const { requiresAuthentication } = require("../passport");
const { string } = require("joi");

/* GET all users listing. */
router.get("/", async (req, res) => {
  res.status(200).json(await db.getAllUsers());
});

// GET user by id
router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    res.status(400).send(`Invalid ID ${req.params.id}`);
    return;
  }

  const result = await db.getUserById(id);
  if (result === undefined) return res.status(400).send(`No user with ID ${id} found.`);
  res.status(200).json(result[0]);
});

// POST create new user
router.post("/", async (req, res) => {
  console.log(req.body);
  const user = req.body;
  user["roleId"] = -1; // Ignored.

  const { error } = schemas.validateUser(user);
  if (error) return res.status(400).send(error.message);
  const users = await db.getAllUsers();
  if (users.find((u) => u.username === user.username || u.email === user.email))
    return res.status(400).send("A user with that username/email already exists.");

  const newId = await db.addNewUser(user);
  console.log(newId);
  if (newId) return res.status(201).send(`User added with ID: ${newId}`);
  return res.status(400).send("An error has occured while trying to add user.");
});

// PUT update user by id
router.put("/:id", requiresAuthentication(false, true), async (req, res) => {
  const id = parseInt(req.params.id);
  console.log(req.user.roleId);
  if (req.user.id !== id && req.user.roleId > db.roles["ADMIN"])
    // Anything less powerful than admin
    return res.status(403).json({ error: "Forbidden" });

  const user = { ...req.body, id: id };

  const result = await db.updateUser(user);
  if (typeof result === "string") return res.status(400).send("An error occured.\n" + result);
  if (result.length === 0) return res.status(400).send(`No user with id ${id}`);
  return res.status(200).send(`User modified with ID: ${result[0].id}`);
});

// DELETE user by id
router.delete("/", requiresAuthentication(), async (req, res) => {
  const id = parseInt(req.user.id);
  const result = await db.deleteUser(id);
  if (typeof result === "string") return res.status(400).send(result);
  res.status(200).send(`User deleted with ID: ${id}`);
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../database');
const { response, request } = require('../app');

/* GET all users listing. */
router.get('/', (req, res) => {
  db.query('SELECT id, username, fullname, profile_picture FROM users', (error, results) => {
    if (error)
      throw error;
    res.status(200).json(results.rows);
  })
});

// GET user by id
router.get('/:id', (req, res) => {
  db.query(`SELECT id, username, fullname, profile_picture FROM users WHERE id = ${req.params.id}`, (error, results) => {
    if (error) throw error;
    res.json(results.rows);
  });
});

// POST create new user
router.post('/', (req, res) => {
  console.log(req.body);
  const { username, password, email, fullname, profilePicture } = req.body;

  db.query('INSERT INTO users (username, password, email, fullname, profile_picture) VALUES ($1, $2, $3, $4, $5) RETURNING id;', [username, password, email, fullname, profilePicture], (error, results) => {
    if (error) throw error;
    res.status(201).send(`User added with ID: ${results.rows[0].id}`);
  });
})

// PUT update user by id
router.put('/:id', (req, res) => {
  const id = parseint(request.params.id);
  const { username, password, email, fullname, profilePicture} = req.body;

  db.query(`UPDATE users SET 
    ${username === undefined ? "username = " + username : ""}, 
    ${password === undefined ? "password = " + password : ""}, 
    ${email === undefined ? "email = " + email : ""}, 
    ${fullname === undefined ? "fullname = " + fullname : ""}, 
    ${profilePicture === undefined ? "profile_picture = " + profilePicture : ""}, 
    WHERE id = ${id}`, (error, results) => {
      if (error) throw error;
      response.status(200).send(`User modified with ID: ${id}`)
    });
});

// DELETE user by id 
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);

  db.query('DELETE FROM users WHERE id = $1', [id], (error, results) => {
    if (error) throw error;
    res.status(200).send(`User deleted with ID: ${id}`);
  })
});

module.exports = router;

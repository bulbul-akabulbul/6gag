const Pool = require("pg").Pool;
const schemas = require("./schemas");
const Joi = require("joi");
const bcrypt = require("bcrypt");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

(async () => {
  // Read roles from database and set up
  pool.query("SELECT * FROM roles", (err, res) => {
    module.roles = res.rows.reduce((pv, cv) => ({ ...pv, [cv.rolename]: cv.id }), {});
    exports.roles = module.roles;
  });
})();

/**
 * Declaring return types:
 * @typedef User
 * @property {number} id - User's ID.
 * @property {string} username - User's username.
 * @property {string} fullname - User's full name to display.
 * @property {string} email - User's email.
 * @property {string} profilePicture - User's base64 encoded profile picture.
 * @property {number} roleId - User's role id, as defined in module.roles.
 *
 * @typedef NewUser
 * @property {string} username User's username. Will be used to authenticate.
 * @property {string} password User's password. Hashed and salted.
 * @property {string} email User's email.
 * @property {string} fullname User's full name. Ready for display.
 * @property {string} profilePicture User's profile picture encoded using Base64.
 */

/**
 * ==============================
 *         Users section
 * ==============================
 */

/**
 * Returns a list of all users.
 * @return {Promise<User[]>} Array of all users. (id, username, fullname, email and profilePicture)
 */
exports.getAllUsers = async () => {
  return (
    await pool.query(
      'SELECT id, username, fullname, email, profile_picture AS "profilePicture", role_id AS "roleId" FROM users'
    )
  ).rows;
};

/**
 * Returns a user object by it's ID.
 * @param {number} id ID of the requested user.
 * @returns {Promise<User>} User.
 */
exports.getUserById = async (id) => {
  return (
    await pool.query(
      'SELECT id, username, fullname, profile_picture AS "profilePicture", role_id AS "roleId" FROM users WHERE id = $1',
      [id]
    )
  ).rows[0];
};

/**
 * Adds a new user to the database.
 * @param {NewUser} user The new user to be added. Everything is required but profilePicture. Default role is USER.
 * @returns {Promise<number>} The ID of the newly created user.
 */
exports.addNewUser = async (user) => {
  // Validate user should never return an error, instead it should be checked by the router function.
  // This is here just for safety reasons.
  const { error } = schemas.validateUser(user);
  if (error) throw error;
  return (
    await pool.query(
      "INSERT INTO users (username, password, email, fullname, profile_picture, role_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;",
      [
        user.username,
        bcrypt.hashSync(user.password, 10),
        user.email,
        user.fullname,
        user.profilePicture,
        module.roles["USER"],
      ]
    )
  ).rows[0].id;
};

/**
 * Updates a user by ID
 * @param {number} id ID of the user to update.
 * @param {NewUser} user The new user values. Undefined values dont change.
 * @returns {Promise<number>} The ID of the updated user.
 */
exports.updateUser = async (id, user) => {
  const { username, password, email, fullname, profilePicture } = user;
  const values = [username, password, email, fullname, profilePicture, id].filter((v) => v !== undefined);
  const q =
    `UPDATE users SET \
${username !== undefined ? ` username = $${values.indexOf(username) + 1}, ` : ""}\
${password !== undefined ? ` password = $${values.indexOf(password) + 1}, ` : ""}\
${email !== undefined ? ` email = $${values.indexOf(email) + 1}, ` : ""}\
${fullname !== undefined ? ` fullname = $${values.indexOf(fullname) + 1}, ` : ""}\
${profilePicture !== undefined ? ` profile_picture = $${values.indexOf(profilePicture) + 1}, ` : ""}`.slice(0, -2) +
    ` WHERE id = $${values.length} RETURNING id;`;
  console.log(q);
  return (await pool.query(q, values)).rows[0].id;
};

/**
 * Returns the password of the user by ID.
 * @param {number} id ID of the user.
 * @returns {Promise<number>} User's password. Hashed and salted!
 */
exports.getUserPassword = async (id) => {
  return (await pool.query("SELECT password FROM users WHERE id = $1", [id])).rows[0].password;
};

/**
 *
 * @param {string} username User's username
 * @returns {Promise<number>} The corresponding user ID.
 */
exports.getUserIdByName = async (username) => {
  return (await pool.query("SELECT id FROM users WHERE username = $1", [username])).rows[0].id;
};

/**
 * Deletes a user from the database.
 * @param {number} id The ID of the user to be deleted.
 * @returns {Promise<number>} The ID of the deleted user.
 */
exports.deleteUser = async (id) => {
  return (await pool.query("DELETE FROM users WHERE id = $1 RETURNING id", [id])).rows[0].id;
};

};

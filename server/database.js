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

exports.getAllUsers = async () => {
  try {
    const results = await pool.query("SELECT id, username, fullname, email, profile_picture FROM users");
    return results.rows;
  } catch (err) {
    throw err;
  }
};

exports.getUserById = async (id) => {
  try {
    return (
      await pool.query(
        'SELECT id, username, fullname, profile_picture AS "profilePicture", role_id AS "roleId" FROM users WHERE id = $1',
        [id]
      )
    ).rows[0];
  } catch (err) {
    throw err;
  }
};

exports.addNewUser = async (user) => {
  // Validate user should never return an error, instead it should be checked by the router function.
  // This is here just for safety reasons.
  const { error } = schemas.validateUser(user);
  if (error) throw error;
  try {
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
  } catch (error) {
    throw error;
  }
};

exports.updateUser = async (user) => {
  const { username, password, email, fullname, profilePicture, id } = user;
  const values = [username, password, email, fullname, profilePicture, id].filter((v) => v !== undefined);
  const q =
    `UPDATE users SET \
${username !== undefined ? ` username = $${values.indexOf(username) + 1}, ` : ""}\
${password !== undefined ? ` password = $${values.indexOf(password) + 1}, ` : ""}\
${email !== undefined ? ` email = $${values.indexOf(email) + 1}, ` : ""}\
${fullname !== undefined ? ` fullname = $${values.indexOf(fullname) + 1}, ` : ""}\
${profilePicture !== undefined ? ` profile_picture = $${values.indexOf(profilePicture) + 1}, ` : ""}`.slice(0, -2) +
    ` WHERE id = $${values.length} RETURNING id;`;
  try {
    console.log(q);
    return (await pool.query(q, values)).rows;
  } catch (err) {
    return err.message;
  }
};

exports.getUserPassword = async (id) => {
  try {
    return (await pool.query("SELECT password FROM users WHERE id = $1", [id])).rows;
  } catch (error) {
    throw error;
  }
};

exports.getUserIdByName = async (username) => {
  try {
    return (await pool.query("SELECT id FROM users WHERE username = $1", [username])).rows;
  } catch (error) {
    throw error;
  }
};

exports.deleteUser = async (id) => {
  try {
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    return id;
  } catch {
    if (error) return error.message;
  }
};

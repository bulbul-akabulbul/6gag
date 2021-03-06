CREATE TABLE roles (
	id int PRIMARY KEY,
	rolename TEXT NOT NULL UNIQUE
);

CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	username VARCHAR(16) NOT NULL UNIQUE,
	password TEXT NOT NULL,
	email TEXT NOT NULL UNIQUE,
	fullname TEXT NOT NULL,
	profile_picture TEXT,
	role_id int NOT NULL
	FOREIGN KEY(role_id) REFERENCES roles(id)
);

CREATE TABLE photos (
	id SERIAL PRIMARY KEY,
	user_id SERIAL,
	picture TEXT NOT NULL,
	description TEXT,
	upload_date TIMESTAMP NOT NULL,
	FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE photo_comments (
	id SERIAL PRIMARY KEY,
	user_id SERIAL,
	picture_id SERIAL,
	comment text NOT NULL,
	comment_date TIMESTAMP NOT NULL,
	FOREIGN KEY(user_id) REFERENCES users(id),
	FOREIGN KEY(picture_id) REFERENCES photos(id)
);

const Joi = require("joi");

exports.user = Joi.object({
  username: Joi.string().alphanum().min(3).max(16).required(),
  password: Joi.string().min(8).required(),
  email: Joi.string().required(),
  fullname: Joi.string().required(),
  profilePicture: Joi.string(),
  roleId: Joi.number().required(),
});

exports.post = Joi.object({
  userId: Joi.number().required(),
  picture: Joi.string().required(),
  description: Joi.string().max(250),
  uploadDate: Joi.date().iso(),
});

exports.photoComment = Joi.object({
  userId: Joi.number().required(),
  pictureId: Joi.number().required(),
  comment: Joi.string().required(),
  commentDate: Joi.date().iso(),
});

exports.validateUser = (user) => {
  return exports.user.validate(user);
};

exports.validatePost = (post) => {
  return exports.post.validate(post);
};

exports.validatePhotoComment = (photoComment) => {
  return exports.photoComment.validate(photoComment);
};

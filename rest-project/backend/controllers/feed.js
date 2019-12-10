const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const Post = require('../models/post');
const User = require('../models/user');

const POSTS_PER_PAGE = 2;

exports.getPosts = (req, res, next) => {
  let currentPage = req.query.page || 1;

  let totalItems;

  return Post.find()
    .countDocuments()
    .then(count => {
      totalItems = count;
      return Post.find()
        .skip((currentPage - 1) * POSTS_PER_PAGE)
        .limit(POSTS_PER_PAGE);
    })
    .then(posts => {
      res.status(200).json({
        message: 'Fetched posts successfully',
        posts: posts,
        totalItems
      });
    })
    .catch(err => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.getPost = (req, res, next) => {
  const { postId } = req.params;

  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Could not find post.');
        error.statuCode = 404;
        throw error;
      }
      res.status(200).json({ message: 'Post fetched.', post });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect');
    error.statusCode = 422;
    throw error;
  }

  if (!req.file) {
    const error = new Error('No image provided.');
    error.statusCode = 422;
    throw error;
  }

  const title = req.body.title;
  const content = req.body.content;
  const imageUrl = req.file.path;
  let creator;
  // Create post in db
  const post = new Post({
    title,
    content,
    imageUrl: imageUrl,
    creator: req.userId
  });

  post
    .save()
    .then(result => {
      return User.findById(req.userId);
    })
    .then(user => {
      creator = user;
      user.posts.push(post);
      return user.save();
    })
    .then(result => {
      res.status(201).json({
        message: 'Post created successfully',
        post: post,
        creator: { _id: creator._id, name: creator.name }
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updatePost = (req, res, next) => {
  const { postId } = req.params;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect');
    error.statusCode = 422;
    throw error;
  }

  const title = req.body.title;
  const content = req.body.content;
  const imageUrl = req.file ? req.file.path : req.body.image;

  if (!imageUrl) {
    const error = new Error('No file picked.');
    error.statusCode = 422;
    throw error;
  }

  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Could not find post.');
        error.statusCode = 404;
        throw error;
      }

      if (post.creator.toString() !== req.userId) {
        const error = new Error('Not authorized!');
        error.statusCode = 403;
        throw error;
      }

      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;
      return post.save();
    })
    .then(result => {
      res.status(200).json({ message: 'Post updated', post: result });
    })
    .catch(err => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err));
};

exports.deletePost = (req, res, next) => {
  const { postId } = req.params;

  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Could not find post');
        err.statusCode = 422;
        throw error;
      }

      if (post.creator.toString() !== req.userId) {
        const error = new Error('Not authorized!');
        error.statusCode = 403;
        throw error;
      }

      clearImage(post.imageUrl);
      return post.delete();
    })
    .then(result => {
      User.findById(req.userId).then(user => {
        // user.posts = user.posts.filter(post => post.toString() !== postId);
        user.posts.pull(postId);
        return user.save();
      });
    })
    .then(result => {
      console.log(result);
      res.status(200).json({ message: 'Post deleted' });
    })
    .catch(err => {
      if (!err.statusCode) error.statusCode = 500;
      next(err);
    });
};

exports.getStatus = (req, res, next) => {
  User.findById(req.userId)
    .then(user => {
      if(!user) {
        const err = new Error('User not found');
        err.statusCode = 400;
        throw(err);
      }
      res.json({ status: user.status });
    })
    .catch(err => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.updateStatus = (req, res, next) => {
  const status = req.body.status;

  User.findById(req.userId)
    .then(user => {
      user.status = status;
      return user.save();
    })
    .then(result => {
      res.status(200).json({ message: 'Status updated' });
    })
    .catch(err => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

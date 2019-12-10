const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const Post = require('../models/post');
const User = require('../models/user');

const io = require('../socket');

const POSTS_PER_PAGE = 2;

exports.getPosts = async (req, res, next) => {
  let currentPage = req.query.page || 1;

  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .populate('creator')
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * POSTS_PER_PAGE)
      .limit(POSTS_PER_PAGE);

    res.status(200).json({
      message: 'Fetched posts successfully',
      posts: posts,
      totalItems
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.getPost = async (req, res, next) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error('Could not find post.');
      error.statuCode = 404;
      throw error;
    }
    res.status(200).json({ message: 'Post fetched.', post });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
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
  // Create post in db
  const post = new Post({
    title,
    content,
    imageUrl: imageUrl,
    creator: req.userId
  }).populate('creator');

  try {
    const result = await post.save();
    const user = await User.findById(req.userId);
    const creator = user;
    user.posts.push(post);
    io.getIO().emit('posts', { action: 'create', post: post });

    await user.save();
    res.status(201).json({
      message: 'Post created successfully',
      post: post,
      creator: { _id: creator._id, name: creator.name }
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
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

  try {
    const post = await Post.findById(postId).populate('creator');
    if (!post) {
      const error = new Error('Could not find post.');
      error.statusCode = 404;
      throw error;
    }

    if (post.creator._id.toString() !== req.userId) {
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
    const result = await post.save();
    io.getIO().emit('posts', { action: 'update', post: result });
    res.status(200).json({ message: 'Post updated', post: result });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err));
};

exports.deletePost = async (req, res, next) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);
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
    await post.delete();
    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    await user.save();
    io.getIO().emit('posts', { action: 'delete', postId });
    res.status(200).json({ message: 'Post deleted' });
  } catch (err) {
    if (!err.statusCode) error.statusCode = 500;
    next(err);
  }
};

exports.getStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 400;
      throw err;
    }
    res.json({ status: user.status });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
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

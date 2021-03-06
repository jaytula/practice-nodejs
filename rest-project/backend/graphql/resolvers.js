const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const User = require('../models/user');
const Post = require('../models/post');

const { clearImage } = require('../util/file');

module.exports = {
  createUser: async function({ userInput }, req) {
    //const email = args.userInput.email;
    const errors = [];
    if (!validator.isEmail(userInput.email)) {
      errors.push({ message: 'E-Mail is invalid.' });
    }
    if (
      validator.isEmpty(userInput.password) ||
      !validator.isLength(userInput.password, { min: 5 })
    ) {
      errors.push({ message: 'Password too short!' });
    }

    if (errors.length) {
      const error = new Error('Invalid input.');
      error.data = errors;
      error.code = 422;
      throw error;
    }

    const existingUser = await User.findOne({ email: userInput.email });
    if (existingUser) {
      const error = new Error('User exists already!');
      throw error;
    }
    const hashedPw = await bcrypt.hash(userInput.password, 12);
    const user = new User({
      email: userInput.email,
      name: userInput.name,
      password: hashedPw
    });
    const createdUser = await user.save();
    return { ...createdUser._doc, _id: createdUser._id.toString() };
  },

  async login({ email, password }) {
    try {
      const user = await User.findOne({ email: email });
      if (!user) {
        const error = new Error('User not found');
        error.code = 401;
        throw error;
      }

      const isEqual = await bcrypt.compare(password, user.password);
      if (!isEqual) {
        const error = new Error('Wrong password!');
        error.code = 401;
        throw error;
      }

      const token = jwt.sign(
        {
          email: user.email,
          userId: user._id.toString()
        },
        process.env.SECRET,
        { expiresIn: '1h' }
      );

      return { token: token, userId: user._id.toString() };
    } catch (err) {
      throw err;
    }
  },

  async createPost({ postInput }, req) {
    if (!req.isAuth) {
      const error = new Error('Not authenticatd!');
      error.code = 401;
      throw error;
    }
    const errors = [];

    if (
      validator.isEmpty(postInput.title) ||
      !validator.isLength(postInput.title, { min: 5 })
    ) {
      errors.push({ message: 'Title is invalid.' });
    }

    if (
      validator.isEmpty(postInput.content) ||
      !validator.isLength(postInput.content, { min: 5 })
    ) {
      errors.push({ message: 'Content is invalid.' });
    }

    if (errors.length) {
      const error = new Error('Invalid input.');
      error.data = errors;
      error.code = 422;
      throw error;
    }

    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error('Invalid user.');
      error.code = 401;
      throw error;
    }
    const post = new Post({
      title: postInput.title,
      content: postInput.content,
      imageUrl: postInput.imageUrl,
      creator: user
    });
    const createdPost = await post.save();
    user.posts.push(createdPost);
    await user.save();

    const responseObject = {
      ...createdPost._doc,
      _id: createdPost._id.toString(),
      createdAt: createdPost.createdAt.toISOString(),
      updatedAt: createdPost.updatedAt.toISOString()
    };
    return responseObject;
  },

  async posts({ page }, req) {
    if (!req.isAuth) {
      const error = new Error('Not authenticatd!');
      error.code = 401;
      throw error;
    }
    const perPage = 2;
    if (!page) {
      page = 1;
    }

    const totalPosts = await Post.countDocuments();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .populate('creator');

    const responseObject = {
      posts: posts.map(p => ({
        ...p._doc,
        _id: p._id.toString(),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString()
      })),
      totalPosts
    };
    return responseObject;
  },

  async post({ id }, req) {
    if (!req.isAuth) {
      const error = new Error('Not Authenicated');
      error.code = 401;
      throw error;
    }
    const post = await Post.findById(id).populate('creator');
    if (!post) {
      const error = new Error('Post not found');
      error.code = 404;
      throw error;
    }

    return {
      ...post._doc,
      _id: post._id.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    };
  },

  updatePost: async function({ id, postInput }, req) {
    if (!req.isAuth) {
      const error = new Error('Not Authenicated');
      error.code = 401;
      throw error;
    }

    const post = await Post.findById(id).populate('creator');
    if (!post) {
      const error = new Error('Post not found');
      error.code = 404;
      throw error;
    }

    if (post.creator._id.toString() !== req.userId.toString()) {
      const error = new Error('Not authorized');
      error.code = 403;
      throw error;
    }

    const errors = [];

    if (
      validator.isEmpty(postInput.title) ||
      !validator.isLength(postInput.title, { min: 5 })
    ) {
      errors.push({ message: 'Title is invalid.' });
    }

    if (
      validator.isEmpty(postInput.content) ||
      !validator.isLength(postInput.content, { min: 5 })
    ) {
      errors.push({ message: 'Content is invalid.' });
    }

    if (errors.length) {
      const error = new Error('Invalid input.');
      error.data = errors;
      error.code = 422;
      throw error;
    }

    post.title = postInput.title;
    post.content = postInput.content;
    if (postInput.imageUrl !== 'undefined') post.imageUrl = postInput.imageUrl;
    const editedPost = await post.save();
    return {
      ...editedPost._doc,
      _id: editedPost._id.toString(),
      createdAt: editedPost.createdAt.toISOString(),
      updatedAt: editedPost.updatedAt.toISOString()
    };
  },

  deletePost: async function({ id }, req) {
    if (!req.isAuth) {
      const error = new Error('Not Authenicated');
      error.code = 401;
      throw error;
    }

    const post = await Post.findById(id);

    if (!post) {
      const error = new Error('Post not found!');
      error.code = 404;
      throw error;
    }

    if (post.creator.toString() !== req.userId.toString()) {
      const error = new Error('Not authorized');
      error.code = 403;
      throw error;
    }

    clearImage(post.imageUrl);

    await post.remove();
    const user = await User.findById(req.userId);
    user.posts.pull(id);
    await user.save();
    return true;
  },

  async user({ id }, req) {
    if(!req.isAuth) {
      const error = new Error('Not authenticated');
      error.code = 401;
      throw error
    }
    id = id ? id : req.userId;

    const user = await User.findById(id);
    if (!user) {
      const error = new Error('No user found');
      error.code = 404;
      throw error;
    }
    return {
      ...user._doc,
      _id: user._id.toString()
    };
  },

  async updateStatus({ id, status }, req) {
    if(!req.isAuth) {
      const error = new Error('Not authenticated');
      error.code = 401;
      throw error
    }
    id = id ? id : req.userId;

    const user = await User.findById(id);
    if (!user) {
      const error = new Error('No user found');
      error.code = 404;
      throw error;
    }
    user.status = status;
    await user.save();
    return {
      ...user._doc,
      _id: user._id.toString()
    };
  }
};

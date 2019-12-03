const { validationResult } = require('express-validator');

exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        _id: '1',
        title: 'First Post',
        content: 'This is the first post!',
        imageUrl: 'images/duck.jpg',
        creator: {
          name: 'Jay'
        },
        createdAt: new Date()
      }
    ]
  });
};

exports.createPost = (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({
        message: 'Validation failed, entered data is incorrect',
        errors: errors.array()
      });
  }
  // Create post in db
  res.status(201).json({
    message: 'Post created successfully',
    post: {
      id: new Date().toISOString(),
      title,
      content,
      creator: {
        name: 'Jay'
      },
      createdAt: new Date()
    }
  });
};

import React, { Component } from 'react';

import Image from '../../../components/Image/Image';
import './SinglePost.css';

const BACKEND = process.env.REACT_APP_BACKEND;
class SinglePost extends Component {
  state = {
    title: '',
    author: '',
    date: '',
    image: '',
    content: ''
  };

  componentDidMount() {
    // eslint-disable-next-line no-unused-vars
    const postId = this.props.match.params.postId;
    const graphqlQuery = {
      query: `
      query GetPost($id: ID!) {
        post(id: $id) {
          _id
          title
          content
          imageUrl
          creator {
            name
          }
          createdAt
        }
      }
      `,
      variables: {
        id: postId
      }
    };
    fetch(`${BACKEND}/graphql`, {
      headers: {
        Authorization: `Bearer ${this.props.token}`,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(graphqlQuery)
    })
      .then(res => {
        return res.json();
      })
      .then(resData => {
        if (resData.errors) {
          throw new Error('Single post retrieval failed!');
        }
        this.setState({
          title: resData.data.post.title,
          author: resData.data.post.creator.name,
          image: `${BACKEND}/${resData.data.post.imageUrl}`,
          date: new Date(resData.data.post.createdAt).toLocaleDateString(
            'en-US'
          ),
          content: resData.data.post.content
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  render() {
    return (
      <section className="single-post">
        <h1>{this.state.title}</h1>
        <h2>
          Created by {this.state.author} on {this.state.date}
        </h2>
        <div className="single-post__image">
          <Image contain imageUrl={this.state.image} />
        </div>
        <p>{this.state.content}</p>
      </section>
    );
  }
}

export default SinglePost;

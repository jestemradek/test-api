import * as chai from 'chai';
import chaiHttp = require('chai-http');
import 'mocha';
import app from '../../src/app';
import { UserModel } from '../../src/schemas/user';
import { BlogPostModel } from '../../src/schemas/blogPost';

chai.use(chaiHttp);
const expect = chai.expect;

const user = {
  email: 'raadek+1@gmail.com',
  password: 'password123',
};

const newUser = {
  _id: null,
  activated: true,
  firstName: 'Janek',
  lastName: 'Nowakowski',
  email: 'raadek+blogPost@gmail.com',
  password: 'pwd222333AA',
  locale: 'pl',
};

const blogPost1 = {
  alias: 'first-post',
  subject: 'First post',
  date: '2020-12-15',
  content: 'Sample text...',
};
const blogPost2 = {
  alias: 'second-post',
  subject: 'Second post',
  date: '2020-12-25',
  content: 'Another text',
};

let token = '';
let token2 = '';
let newUserId = '';
let blogPostId = '';

before(done => {
  BlogPostModel.deleteMany({}, () => {
    UserModel.deleteOne({ email: newUser.email }, () => {
      done();
    });
  });
});

describe('blogPostRoute', () => {
  it('user should be able to login', () => {
    return chai
      .request(app)
      .get(`/user/login`)
      .send({ email: user.email, password: user.password })
      .then(res => {
        expect(res.status).to.be.equal(200);
        token = res.body.token;
      });
  });

  it('user should be able get own list of blogPosts and the list is empty', () => {
    return chai
      .request(app)
      .get(`/user/blogPosts`)
      .set('Authorization', `Bearer ${token}`)
      .then(res => {
        expect(res.status).to.be.equal(200);
        expect(res.body).to.deep.equal([]);
      });
  });

  it('user should be able create blogPost and get it back', () => {
    return chai
      .request(app)
      .post(`/user/blogPost`)
      .set('Authorization', `Bearer ${token}`)
      .send(blogPost1)
      .then(res => {
        expect(res.status).to.be.equal(201);
        expect(res.body.alias).to.be.equal(blogPost1.alias);
        expect(res.body.date).to.be.equal(new Date(blogPost1.date).toISOString());
        expect(res.body.subject).to.be.equal(blogPost1.subject);
        expect(res.body.content).to.be.equal(blogPost1.content);
        blogPostId = res.body._id;
      });
  });

  it('user should be able to get certain blogPost', () => {
    return chai
      .request(app)
      .get(`/user/blogPost/${blogPostId}`)
      .set('Authorization', `Bearer ${token}`)
      .then(res => {
        expect(res.status).to.be.equal(200);
        expect(res.body.alias).to.be.equal(blogPost1.alias);
        expect(res.body.date).to.be.equal(new Date(blogPost1.date).toISOString());
        expect(res.body.subject).to.be.equal(blogPost1.subject);
        expect(res.body.content).to.be.equal(blogPost1.content);
      });
  });

  it('user should be able to update blogPost and get it back', () => {
    return chai
      .request(app)
      .patch(`/user/blogPost/${blogPostId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(blogPost2)
      .then(res => {
        expect(res.status).to.be.equal(200);
        expect(res.body.alias).to.be.equal(blogPost2.alias);
        expect(res.body.date).to.be.equal(new Date(blogPost2.date).toISOString());
        expect(res.body.subject).to.be.equal(blogPost2.subject);
        expect(res.body.content).to.be.equal(blogPost2.content);
      });
  });

  it('user should be able to delete blogPost', () => {
    return chai
      .request(app)
      .delete(`/user/blogPost/${blogPostId}`)
      .set('Authorization', `Bearer ${token}`)
      .then(res => {
        expect(res.status).to.be.equal(204);
      });
  });

  it('user should not be able to get deleted blogPost', () => {
    return chai
      .request(app)
      .get(`/user/blogPost/${blogPostId}`)
      .set('Authorization', `Bearer ${token}`)
      .then(res => {
        expect(res.status).to.be.equal(404);
      });
  });

  it('user should not be able to get foreign blogPost', async () => {
    await chai
      .request(app)
      .post('/user')
      .send(newUser)
      .then(res => {
        newUserId = res.body._id;
      });
    await UserModel.findById(newUserId).then(async newUserFromMongo => {
      await chai
        .request(app)
        .patch(`/user/activation`)
        .send({
          email: newUser.email,
          activationToken: newUserFromMongo.activationToken,
        });
    });
    await chai
      .request(app)
      .get(`/user/login`)
      .send({ email: newUser.email, password: newUser.password })
      .then(res => {
        token2 = res.body.token;
      });
    await chai
      .request(app)
      .post(`/user/blogPost`)
      .set('Authorization', `Bearer ${token2}`)
      .send(blogPost1)
      .then(res => {
        blogPostId = res.body._id;
      });
    return chai
      .request(app)
      .get(`/user/blogPost/${blogPostId}`)
      .set('Authorization', `Bearer ${token}`)
      .then(res => {
        expect(res.status).to.be.equal(404);
      });
  });

  it('user should not be able to update foreign blogPost', async () => {
    return chai
      .request(app)
      .patch(`/user/blogPost/${blogPostId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(blogPost2)
      .then(res => {
        expect(res.status).to.be.equal(404);
      });
  });

  it('user should not be able to delete foreign blogPost', async () => {
    return chai
      .request(app)
      .delete(`/user/blogPost/${blogPostId}`)
      .set('Authorization', `Bearer ${token}`)
      .then(res => {
        expect(res.status).to.be.equal(404);
      });
  });
});

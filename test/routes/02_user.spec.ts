import * as chai from 'chai';
import chaiHttp = require('chai-http');
import 'mocha';
import app from '../../src/app';
import { UserModel } from '../../src/schemas/user';

chai.use(chaiHttp);
const expect = chai.expect;

const user = {
  _id: null,
  activated: true,
  firstName: 'Jan',
  lastName: 'Kowalski',
  email: 'raadek+1@gmail.com',
  password: 'password123',
  locale: 'en',
};

const user2 = {
  _id: null,
  firstName: 'Anna',
  lastName: 'Nowak',
  email: 'raadek+2@gmail.com',
  password: 'password1234',
  locale: 'pl',
};

const newPassword = { password: 'zxcvbnMxz12' };
const newEmailAndData = {
  email: 'raadek+3@gmail.com',
  firstName: 'Bolesław',
  lastName: 'Chrobry',
};

const tokens = { first: '', second: '' };
let user2Id: string;

before(done => {
  expect(UserModel.modelName).to.be.equal('User');

  UserModel.deleteMany({}, () => {
    const newUser = new UserModel(user);
    UserModel.register(newUser, user.password, () => {
      done();
    });
  });
});

describe('userRoute', () => {
  it('user should be able to login', () => {
    return chai
      .request(app)
      .get(`/user/login`)
      .send({ email: user.email, password: user.password })
      .then(res => {
        expect(res.status).to.be.equal(200);
        tokens.first = res.body.token;
      });
  });

  it('should be respond bad request for empty email or password on login ', () => {
    return chai
      .request(app)
      .get(`/user/login`)
      .then(res => {
        expect(res.status).to.be.equal(400);
      });
  });

  it('should respond with HTTP 401 status when using wrong token because authorization is failed', () => {
    return chai
      .request(app)
      .get(`/user`)
      .set('Authorization', `Bearer random1230987`)
      .then(res => {
        expect(res.status).to.be.equal(401);
      });
  });

  it('should try create a new user and retrieve error, password is too easy', () => {
    return chai
      .request(app)
      .post('/user')
      .send(user2)
      .then(res => {
        expect(res.status).to.be.equal(400);
      });
  });

  it('should create a new user and retrieve it back', () => {
    user2.password = 'HardPass123';
    return chai
      .request(app)
      .post('/user')
      .send(user2)
      .then(res => {
        expect(res.status).to.be.equal(201);
        expect(res.body.email).to.be.equal(user2.email);
        user2Id = res.body._id;
      });
  });

  it(`user shouldn't be able to login because is not activated`, () => {
    return chai
      .request(app)
      .get(`/user/login`)
      .send({ email: user2.email, password: user2.password })
      .then(res => {
        tokens.second = res.body.token;
        expect(res.status).to.be.equal(403);
      });
  });

  it(`user should be able to activate own account`, async () => {
    await UserModel.findOne({ _id: user2Id }).then(user2fromMongo => {
      return chai
        .request(app)
        .patch(`/user/activation`)
        .send({
          email: user2.email,
          activationToken: user2fromMongo.activationToken,
        })
        .then(res => {
          expect(res.status).to.be.equal(204);
        });
    });
  });

  it('user should be able to login', () => {
    return chai
      .request(app)
      .get(`/user/login`)
      .send({ email: user2.email, password: user2.password })
      .then(res => {
        tokens.second = res.body.token;
        expect(res.status).to.be.equal(200);
      });
  });

  it('the same user can get own profile', () => {
    return chai
      .request(app)
      .get(`/user`)
      .set('Authorization', `Bearer ${tokens.second}`)
      .then(res => {
        expect(res.status).to.be.equal(200);
        expect(res.body.email).to.be.equal(user2.email);
      });
  });

  it('should return error 400 when try to create a new user with already registered email', () => {
    return chai
      .request(app)
      .post('/user')
      .send(user2)
      .then(res => {
        expect(res.status).to.be.equal(400);
      });
  });

  it('should update e-mail and some data of the user', () => {
    return chai
      .request(app)
      .patch(`/user`)
      .set('Authorization', `Bearer ${tokens.second}`)
      .send(newEmailAndData)
      .then(res => {
        expect(res.status).to.be.equal(204);
      });
  });

  it('user with new email should be able to login', () => {
    return chai
      .request(app)
      .get(`/user/login`)
      .send({ email: newEmailAndData.email, password: user2.password })
      .then(res => {
        tokens.second = res.body.token;
        expect(res.status).to.be.equal(200);
      });
  });

  it('wait one second to change password later than get token', function(done) {
    setTimeout(function() {
      done();
    }, 1000);
  });

  it('should update password of the user', () => {
    return chai
      .request(app)
      .patch(`/user`)
      .set('Authorization', `Bearer ${tokens.second}`)
      .send(newPassword)
      .then(res => {
        expect(res.status).to.be.equal(204);
      });
  });

  it('user with changed password must have outdated token and unable to get any data', () => {
    return chai
      .request(app)
      .get(`/user`)
      .set('Authorization', `Bearer ${tokens.second}`)
      .then(res => {
        expect(res.status).to.be.equal(401);
      });
  });

  it('user with new password should be able to login', () => {
    return chai
      .request(app)
      .get(`/user/login`)
      .send({ email: newEmailAndData.email, password: newPassword.password })
      .then(res => {
        tokens.second = res.body.token;
        expect(res.status).to.be.equal(200);
      });
  });

  it('should return the user updated on the steps before with new data', () => {
    return chai
      .request(app)
      .get(`/user`)
      .set('Authorization', `Bearer ${tokens.second}`)
      .then(res => {
        expect(res.status).to.be.equal(200);
        expect(res.body.firstName).to.be.equal(newEmailAndData.firstName);
        expect(res.body.lastName).to.be.equal(newEmailAndData.lastName);
        expect(res.body.email).to.be.equal(newEmailAndData.email);
      });
  });

  it('should remove an existent user', () => {
    return chai
      .request(app)
      .del(`/user`)
      .set('Authorization', `Bearer ${tokens.second}`)
      .then(res => {
        expect(res.status).to.be.equal(204);
      });
  });
});

const { app, expect, request } = require('./common.spec');
const { createUser, fetchUser, destroyUser } = require('../lib/user.lib');
const { hashPassword } = require('../lib/utility.lib');

describe('User Registration Test', () => {
  describe('Positive Tests', () => {
    it('should register user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          username: `${Date.now()}_ox`,
          firstname: 'leo',
          lastname: 'lenzo',
          email: `${Date.now()}_kufre@example.com`,
          password: 'test123',
        })
        .set('Accept', 'application/json')
        .expect(201);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('accessToken');
      expect(resp_data).to.have.property('refreshToken');
      expect(resp_data.accessToken).to.be.an('string');
      expect(resp_data.accessToken).to.not.equal('');
      expect(resp_data.refreshToken).to.be.an('string');
      expect(resp_data.refreshToken).to.not.equal('');
    });
    it('should login user successfully', async () => {
      const email = `${Date.now()}_example@example.com`;
      await request(app)
        .post('/api/v1/auth/signup')
        .send({
          username: `${Date.now()}_ox`,
          firstname: 'leo',
          lastname: 'lenzo',
          email,
          password: 'test123',
        })
        .set('Accept', 'application/json')
        .expect(201);
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email,
          password: 'test123',
        })
        .set('Accept', 'application/json')
        .expect(200);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('accessToken');
      expect(resp_data).to.have.property('refreshToken');
      expect(resp_data.accessToken).to.be.an('string');
      expect(resp_data.accessToken).to.not.equal('');
      expect(resp_data.refreshToken).to.be.an('string');
      expect(resp_data.refreshToken).to.not.equal('');
    });
  });

  describe('Negative Tests', () => {
    const user = {
      username: 'kufre',
      firstname: 'Kufre',
      lastname: 'Okon',
      email: 'kufre@example.com',
      password: 'test123',
    };
    before(async () => {
      const password = await hashPassword('test123');
      await createUser({ ...user, password });
    });
    it('should not register user successfully when an email is reuse', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send(user)
        .set('Accept', 'application/json')
        .expect(200);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('Error');
      expect(resp_data.Error).to.be.an('string');
      expect(resp_data.Error).to.equal('Email already taken');
    });
    it('should not register user successfully when an username is reuse', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({ ...user, email: 'kufre@email.com' })
        .set('Accept', 'application/json')
        .expect(200);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('Error');
      expect(resp_data.Error).to.be.an('string');
      expect(resp_data.Error).to.equal('Username already taken');
    });
    it('should not login user successfully because of incorrect email', async () => {
      const password = await hashPassword('test123');
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ ...user, password })
        .set('Accept', 'application/json')
        .expect(401);
      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('message');
      expect(resp_data.message).to.equal('Incorrect email or password');
    });
    it('should not login user successfully because of incorrect password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ ...user, password: 'kufre@email.com' })
        .set('Accept', 'application/json')
        .expect(401);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('message');
      expect(resp_data.message).to.equal('Incorrect email or password');
    });
    after(async () => {
      const userToDelete = await fetchUser({ username: user.username });
      await destroyUser(userToDelete.id, true);
    });
  });
});

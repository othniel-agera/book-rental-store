const {
  app, expect, request, putRequest, getRequest,
} = require('./common.spec');
const UserLib = require('../lib/user.lib');
const { hashPassword } = require('../utils/utility.util');

const {
  createUser, fetchUser, fetchUsers, destroyUser, updateUser,
} = new UserLib();

describe('User Registration Test', () => {
  describe('Positive Tests', () => {
    let token;
    let userToDelete;
    const user = {
      username: `${Date.now()}_kufre`,
      firstname: `${Date.now()}_Kufre`,
      lastname: `${Date.now()}_Okon`,
      email: `${Date.now()}_example@example.com`,
      password: 'Test1234',
    };
    // eslint-disable-next-line func-names
    before(async function () {
      this.timeout(10000);
      const password = await hashPassword(user.password);
      await createUser({ ...user, password });
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: user.email, password: user.password })
        .set('Accept', 'application/json');
      token = response.body.accessToken;
    });
    // eslint-disable-next-line func-names
    it('should register user successfully', async function () {
      this.timeout(10000);
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          username: `${Date.now()}_ox`,
          firstname: 'leo',
          lastname: 'lenzo',
          email: `${Date.now()}_kufre@example.com`,
          password: 'Test1234',
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
      const emailPassword = { email: `${Date.now()}_example@example.com`, password: 'Test1234' };
      await request(app)
        .post('/api/v1/auth/signup')
        .send({
          username: `${Date.now()}_ox`,
          firstname: 'leo',
          lastname: 'lenzo',
          ...emailPassword,
        })
        .set('Accept', 'application/json')
        .expect(201);
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          ...emailPassword,
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
    it('should update loggedin user successfully', async () => {
      const response = await putRequest('/auth/updatedetails', token)
        .send({
          username: `${Date.now()}_ox`,
          firstname: 'leo',
          lastname: 'lenzo',
        })
        .expect(200);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('success');
      expect(resp_data).to.have.property('data');
      expect(resp_data.success).to.be.an('boolean');
      expect(resp_data.data).to.be.an('object');
      expect(resp_data.success).to.equal(true);
    });
    it('should be able to get loggedin user details successfully', async () => {
      const response = await getRequest('/auth/me', token)
        .expect(200);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('success');
      expect(resp_data).to.have.property('data');
      expect(resp_data.success).to.be.an('boolean');
      expect(resp_data.data).to.be.an('object');
      expect(resp_data.success).to.equal(true);
    });
    it('should fetch all the users successfully', async () => {
      const response = await fetchUsers();

      expect(response).to.be.an('array');
    });
    // eslint-disable-next-line func-names
    after(async function () {
      this.timeout(10000);
      userToDelete = await fetchUser({ username: user.username });
      if (userToDelete) { await destroyUser(userToDelete.id, true); }
    });
  });

  describe('Negative Tests', () => {
    const user = {
      username: `${Date.now()}_ox`,
      firstname: 'Kufre',
      lastname: 'Okon',
      email: `${Date.now()}_negative.example@example.com`,
      password: 'Test1234',
    };
    before(async () => {
      const password = await hashPassword('Test1234');
      await createUser({ ...user, password });
    });
    it('should not register user successfully when an email is already in use', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send(user)
        .set('Accept', 'application/json')
        .expect(400);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('success');
      expect(resp_data).to.have.property('error');
      expect(resp_data.success).to.be.an('boolean');
      expect(resp_data.success).to.equal(false);
      expect(resp_data.error).to.be.an('string');
      expect(resp_data.error).to.equal('Email already taken');
    });
    it('should not register user successfully when an username is already in use', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({ ...user, email: 'kufre@email.com' })
        .set('Accept', 'application/json')
        .expect(400);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('success');
      expect(resp_data).to.have.property('error');
      expect(resp_data.success).to.be.an('boolean');
      expect(resp_data.success).to.equal(false);
      expect(resp_data.error).to.be.an('string');
      expect(resp_data.error).to.equal('Username already taken');
    });
    it('should not login user successfully because of incorrect email', async () => {
      const password = await hashPassword('Test1234');
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'tgegge@yghben.com', password })
        .set('Accept', 'application/json')
        .expect(401);
      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('success');
      expect(resp_data).to.have.property('error');
      expect(resp_data.success).to.be.an('boolean');
      expect(resp_data.success).to.equal(false);
      expect(resp_data.error).to.be.an('string');
      expect(resp_data.error).to.equal('Incorrect email or password');
    });
    it('should not login user successfully because of incorrect password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: user.email, password: 'Kufre1email.com' })
        .set('Accept', 'application/json')
        .expect(401);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('success');
      expect(resp_data).to.have.property('error');
      expect(resp_data.success).to.be.an('boolean');
      expect(resp_data.success).to.equal(false);
      expect(resp_data.error).to.be.an('string');
      expect(resp_data.error).to.equal('Incorrect email or password');
    });
    it('should just throw an error, createUser', async () => {
      await expect(createUser(333)).to.eventually.be.rejectedWith('user validation failed: username: Path `username` is required., firstname: Path `firstname` is required., lastname: Path `lastname` is required., email: Path `email` is required., password: Path `password` is required.');
    });
    it('should just throw an error, updateUser', async () => {
      await expect(updateUser(333)).to.eventually.be.rejectedWith('Cast to ObjectId failed for value "333" (type number) at path "_id" for model "user"');
    });
    it('should just throw an error, destroyUser', async () => {
      await expect(destroyUser({ _id: 333 })).to.eventually.be.rejectedWith('Cast to ObjectId failed for value "333" (type number) at path "_id" for model "user"');
    });
    after(async () => {
      const userToDelete = await fetchUser({ username: user.username });
      if (userToDelete) { await destroyUser(userToDelete.id, true); }
    });
  });
});

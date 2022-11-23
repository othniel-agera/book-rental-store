const {
  app, expect, request, postRequest, putRequest, getRequest, deleteRequest,
} = require('./common.spec');
const UserLib = require('../lib/user.lib');
const BookLib = require('../lib/book.lib');
const { hashPassword } = require('../utils/utility.util');

const { createUser, fetchUser, destroyUser } = new UserLib();
const { createBook } = new BookLib();

describe('Book related tests', () => {
  let token;
  let userToDelete;
  let user;
  const userData = {
    username: `${Date.now()}_kufre`,
    firstname: `${Date.now()}_Kufre`,
    lastname: `${Date.now()}_Okon`,
    email: `${Date.now()}_book.example@example.com`,
    password: 'Test1234',
  };
    // eslint-disable-next-line func-names
  before(async function () {
    this.timeout(10000);
    const password = await hashPassword(userData.password);
    user = await createUser({ ...userData, password });
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: userData.email, password: userData.password })
      .set('Accept', 'application/json');
    token = response.body.accessToken;
  });
  describe('Positive Tests', () => {
    it('should create a book successfully', async () => {
      const response = await postRequest('/books', token)
        .send({
          title: `${Date.now()}_Devworks  Bootcamp`,
          description: 'Devworks is a full stack JavaScript Bootcamp located in the heart of Boston that focuses on the technologies you need to get a high paying job as a web developer',
          subject: 'technology',
          authorInformation: user.id,
          dimension: {
            height: 5,
            width: 10,
            unitOfMeasurement: 'cm',
          },
          pricing: {
            dailyRate: 5,
            currency: 'NGN',
          },
        })
        .expect(201);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('success');
      expect(resp_data).to.have.property('data');
      expect(resp_data.success).to.be.an('boolean');
      expect(resp_data.accessToken).to.not.equal(true);
      expect(resp_data.data).to.be.an('object');
      expect(resp_data.data).to.have.property('_id');
      expect(resp_data.data).to.have.property('createdAt');
      expect(resp_data.data).to.have.property('updatedAt');
    });
    it('should edit a book successfully', async () => {
      const book = await createBook({
        title: `${Date.now()}_Devworks  Bootcamp`,
        description: 'Devworks is a full stack JavaScript Bootcamp located in the heart of Boston that focuses on the technologies you need to get a high paying job as a web developer',
        subject: 'technology',
        authorInformation: user.id,
        dimension: {
          height: 5,
          width: 10,
          unitOfMeasurement: 'cm',
        },
        pricing: {
          dailyRate: 5,
          currency: 'NGN',
        },
      });
      // eslint-disable-next-line no-underscore-dangle
      const response = await putRequest(`/books/${book._id}`, token)
        .send({ title: `${Date.now()}_Devworks  Bootcamp` })
        .expect(202);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('success');
      expect(resp_data).to.have.property('data');
      expect(resp_data.success).to.be.an('boolean');
      expect(resp_data.accessToken).to.not.equal(true);
      expect(resp_data.data).to.be.an('object');
      expect(resp_data.data).to.have.property('_id');
      expect(resp_data.data).to.have.property('createdAt');
      expect(resp_data.data).to.have.property('updatedAt');
    });
    it('should edit a book with inStock successfully', async () => {
      const book = await createBook({
        title: `${Date.now()}_Devworks  Bootcamp`,
        description: 'Devworks is a full stack JavaScript Bootcamp located in the heart of Boston that focuses on the technologies you need to get a high paying job as a web developer',
        subject: 'technology',
        authorInformation: user.id,
        dimension: {
          height: 5,
          width: 10,
          unitOfMeasurement: 'cm',
        },
        pricing: {
          dailyRate: 5,
          currency: 'NGN',
        },
      });
      // eslint-disable-next-line no-underscore-dangle
      const response = await putRequest(`/books/${book._id}/add-instock`, token)
        .send({ inStock: 23 })
        .expect(202);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('success');
      expect(resp_data).to.have.property('data');
      expect(resp_data.success).to.be.an('boolean');
      expect(resp_data.accessToken).to.not.equal(true);
      expect(resp_data.data).to.be.an('object');
      expect(resp_data.data).to.have.property('_id');
      expect(resp_data.data).to.have.property('quantity');
      expect(resp_data.data.quantity).to.have.property('inStock');
    });
    it('should get all the books successfully', async () => {
      const response = await getRequest('/books', token)
        .expect(200);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('success');
      expect(resp_data).to.have.property('totalCount');
      expect(resp_data).to.have.property('countOnPage');
      expect(resp_data).to.have.property('pagination');
      expect(resp_data).to.have.property('data');
      expect(resp_data.success).to.be.an('boolean');
      expect(resp_data.accessToken).to.not.equal(true);
      expect(resp_data.data).to.be.an('array');
    });
    it('should get all my books successfully', async () => {
      createBook({
        title: `${Date.now()}_Devworks  Bootcamp`,
        description: 'Devworks is a full stack JavaScript Bootcamp located in the heart of Boston that focuses on the technologies you need to get a high paying job as a web developer',
        subject: 'technology',
        authorInformation: user.id,
        dimension: {
          height: 5,
          width: 10,
          unitOfMeasurement: 'cm',
        },
        pricing: {
          dailyRate: 5,
          currency: 'NGN',
        },
      });
      const response = await getRequest('/books/mine', token)
        .expect(200);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('success');
      expect(resp_data).to.have.property('totalCount');
      expect(resp_data).to.have.property('countOnPage');
      expect(resp_data).to.have.property('pagination');
      expect(resp_data).to.have.property('data');
      expect(resp_data.success).to.be.an('boolean');
      expect(resp_data.accessToken).to.not.equal(true);
      expect(resp_data.data).to.be.an('array');
    });
    it('should get a specific book successfully', async () => {
      const book = await createBook({
        title: `${Date.now()}_Devworks  Bootcamp`,
        description: 'Devworks is a full stack JavaScript Bootcamp located in the heart of Boston that focuses on the technologies you need to get a high paying job as a web developer',
        subject: 'technology',
        authorInformation: user.id,
        dimension: {
          height: 5,
          width: 10,
          unitOfMeasurement: 'cm',
        },
        pricing: {
          dailyRate: 5,
          currency: 'NGN',
        },
      });
      // eslint-disable-next-line no-underscore-dangle
      const response = await getRequest(`/books/${book._id}`, token)
        .expect(200);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('success');
      expect(resp_data).to.have.property('data');
      expect(resp_data.success).to.be.an('boolean');
      expect(resp_data.accessToken).to.not.equal(true);
      expect(resp_data.data).to.be.an('object');
      expect(resp_data.data).to.have.property('_id');
    });
    it('should delete a specific book successfully', async () => {
      const book = await createBook({
        title: `${Date.now()}_Devworks  Bootcamp`,
        description: 'Devworks is a full stack JavaScript Bootcamp located in the heart of Boston that focuses on the technologies you need to get a high paying job as a web developer',
        subject: 'technology',
        authorInformation: user.id,
        dimension: {
          height: 5,
          width: 10,
          unitOfMeasurement: 'cm',
        },
        pricing: {
          dailyRate: 5,
          currency: 'NGN',
        },
      });
      // eslint-disable-next-line no-underscore-dangle
      const response = await deleteRequest(`/books/${book._id}`, token)
        .send({ inStock: 23 })
        .expect(202);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('success');
      expect(resp_data.success).to.be.an('boolean');
    });
  });
  describe('Negative Tests', () => {
    it('should not create book successfully title of book already exists', async () => {
      const title = `${Date.now()}_Devworks  Bootcamp`;
      await createBook({
        title,
        description: 'Devworks is a full stack JavaScript Bootcamp located in the heart of Boston that focuses on the technologies you need to get a high paying job as a web developer',
        subject: 'technology',
        authorInformation: user.id,
        dimension: {
          height: 5,
          width: 10,
          unitOfMeasurement: 'cm',
        },
        pricing: {
          dailyRate: 5,
          currency: 'NGN',
        },
      });
      const response = await postRequest('/books', token)
        .send({
          title,
          description: 'Devworks is a full stack JavaScript Bootcamp located in the heart of Boston that focuses on the technologies you need to get a high paying job as a web developer',
          subject: 'technology',
          authorInformation: user.id,
          dimension: {
            height: 5,
            width: 10,
            unitOfMeasurement: 'cm',
          },
          pricing: {
            dailyRate: 5,
            currency: 'NGN',
          },
        })
        .expect(400);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('success');
      expect(resp_data).to.have.property('error');
      expect(resp_data.success).to.be.an('boolean');
      expect(resp_data.success).to.equal(false);
      expect(resp_data.error).to.be.an('string');
    });
    it('should not create book successfully description is missing', async () => {
      const response = await postRequest('/books', token)
        .send({
          title: `${Date.now()}_Devworks  Bootcamp`,
          subject: 'technology',
          authorInformation: user.id,
          dimension: {
            height: 5,
            width: 10,
            unitOfMeasurement: 'cm',
          },
          pricing: {
            dailyRate: 5,
            currency: 'NGN',
          },
        })
        .expect(422);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('success');
      expect(resp_data).to.have.property('error');
      expect(resp_data.success).to.be.an('boolean');
      expect(resp_data.success).to.equal(false);
      expect(resp_data.error).to.be.an('string');
      // eslint-disable-next-line quotes
      expect(resp_data.error).to.equal(`ValidationError: "description" is required`);
    });
    it('should not update book successfully, invalid ID', async () => {
      const response = await putRequest('/books/eeeeeee', token)
        .send({
          title: `${Date.now()}_Devworks  Bootcamp`,
          subject: 'technology',
          authorInformation: user.id,
          dimension: {
            height: 5,
            width: 10,
            unitOfMeasurement: 'cm',
          },
          pricing: {
            dailyRate: 5,
            currency: 'NGN',
          },
        })
        .expect(404);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('success');
      expect(resp_data).to.have.property('error');
      expect(resp_data.success).to.be.an('boolean');
      expect(resp_data.success).to.equal(false);
      expect(resp_data.error).to.be.an('string');
      // eslint-disable-next-line quotes
      expect(resp_data.error).to.equal(`Resource not found.`);
    });
    it('should not update book successfully, no such book ID', async () => {
      const response = await putRequest('/books/636cda0b011883107d392958', token)
        .send({
          title: `${Date.now()}_Devworks  Bootcamp`,
          subject: 'technology',
          authorInformation: user.id,
          dimension: {
            height: 5,
            width: 10,
            unitOfMeasurement: 'cm',
          },
          pricing: {
            dailyRate: 5,
            currency: 'NGN',
          },
        })
        .expect(404);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('success');
      expect(resp_data).to.have.property('error');
      expect(resp_data.success).to.be.an('boolean');
      expect(resp_data.success).to.equal(false);
      expect(resp_data.error).to.be.an('string');
      // eslint-disable-next-line quotes
      expect(resp_data.error).to.equal(`Book with id: 636cda0b011883107d392958 does not exist on the database`);
    });
    it('should not update book successfully, no such book ID', async () => {
      const response = await putRequest('/books/636cda0b011883107d392958/add-instock', token)
        .send({ title: `${Date.now()}_Devworks  Bootcamp` })
        .expect(422);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('success');
      expect(resp_data).to.have.property('error');
      expect(resp_data.success).to.be.an('boolean');
      expect(resp_data.success).to.equal(false);
      expect(resp_data.error).to.be.an('string');
      // eslint-disable-next-line quotes
      expect(resp_data.error).to.contain(`ValidationError`);
    });
    it('should not get book successfully, no such book ID', async () => {
      const response = await getRequest('/books/636cda0b011883107d392958', token)
        .expect(404);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('success');
      expect(resp_data).to.have.property('error');
      expect(resp_data.success).to.be.an('boolean');
      expect(resp_data.success).to.equal(false);
      expect(resp_data.error).to.be.an('string');
      // eslint-disable-next-line quotes
      expect(resp_data.error).to.contain(`Book with id: 636cda0b011883107d392958 does not exist on the database`);
    });
    it('should not delete book successfully, no such book ID', async () => {
      const response = await deleteRequest('/books/636cda0b011883107d392958', token)
        .expect(404);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('success');
      expect(resp_data).to.have.property('error');
      expect(resp_data.success).to.be.an('boolean');
      expect(resp_data.success).to.equal(false);
      expect(resp_data.error).to.be.an('string');
      // eslint-disable-next-line quotes
      expect(resp_data.error).to.contain(`Book with id: 636cda0b011883107d392958 does not exist on the database`);
    });
  });
  // eslint-disable-next-line func-names
  after(async function () {
    this.timeout(10000);
    userToDelete = await fetchUser({ username: user.username });
    if (userToDelete) { await destroyUser(userToDelete.id, true); }
  });
});

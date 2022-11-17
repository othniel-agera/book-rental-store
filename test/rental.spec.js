const { ObjectID } = require('mongodb');
const {
  app, expect, request, postRequest, putRequest, getRequest, deleteRequest,
} = require('./common.spec');
const UserLib = require('../lib/user.lib');
const BookLib = require('../lib/book.lib');
const RentalLib = require('../lib/rental.lib');
const { hashPassword } = require('../utils/utility.util');

const { createUser, fetchUser, destroyUser } = new UserLib();
const { createBook } = new BookLib();
const { createRental } = new RentalLib();

describe('Rental related tests', () => {
  let token;
  let userToDelete;
  let user;
  let book;
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
    book = await createBook({
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
  });
  describe('Positive Tests', () => {
    it('should rental a book successfully', async () => {
      const response = await postRequest('/rentals', token)
        .send(
          {
            rentalText: `${Date.now()}_Devworks  Bootcamp rental`,
            stars: 3,
            user: user.id,
            book: book.id,
          },
        )
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
    it('should edit a book rental successfully', async () => {
      const rental = await createRental({
        rentalText: `${Date.now()}_Devworks  Bootcamp rental`,
        stars: 3,
        user: user.id,
        book: book.id,
      });
      // eslint-disable-next-line no-underscore-dangle
      const response = await putRequest(`/rentals/${rental._id}`, token)
        .send({ rentalText: `${Date.now()}_Devworks  Bootcamp rental` })
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
      expect(resp_data.data.createdAt).to.not.equal(resp_data.data.updatedAt);
    });
    it('should like book rental successfully', async () => {
      const rental = await createRental({
        rentalText: `${Date.now()}_Devworks  Bootcamp rental`,
        stars: 3,
        user: user.id,
        book: book.id,
      });
      // eslint-disable-next-line no-underscore-dangle
      const response = await putRequest(`/rentals/${rental._id}/likes`, token)
        .send({ action: 'like' })
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
      expect(resp_data.data.createdAt).to.not.equal(resp_data.data.updatedAt);
      expect(resp_data.data.likes).to.be.an('array');
      expect(resp_data.data.likes).to.include(user.id);
    });
    it('should unlike book rental successfully', async () => {
      const rental = await createRental({
        rentalText: `${Date.now()}_Devworks  Bootcamp rental`,
        stars: 3,
        user: user.id,
        book: book.id,
      });
      // eslint-disable-next-line no-underscore-dangle
      await putRequest(`/rentals/${rental._id}/likes`, token)
        .send({ action: 'like' })
        .expect(202);
      // eslint-disable-next-line no-underscore-dangle
      const response = await putRequest(`/rentals/${rental._id}/likes`, token)
        .send({ action: 'unlike' })
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
      expect(resp_data.data.createdAt).to.not.equal(resp_data.data.updatedAt);
      expect(resp_data.data.likes).to.be.an('array');
      expect(resp_data.data.likes).to.not.include(user.id);
    });
    it('should get all the rentals to a books successfully', async () => {
      const response = await getRequest('/rentals', token)
        .expect(200);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('success');
      expect(resp_data).to.have.property('count');
      expect(resp_data).to.have.property('pagination');
      expect(resp_data).to.have.property('data');
      expect(resp_data.success).to.be.an('boolean');
      expect(resp_data.accessToken).to.not.equal(true);
      expect(resp_data.data).to.be.an('array');
    });
    it('should get a specific book rental successfully', async () => {
      const rental = await createRental({
        rentalText: `${Date.now()}_Devworks  Bootcamp rental`,
        stars: 3,
        user: user.id,
        book: book.id,
      });
      // eslint-disable-next-line no-underscore-dangle
      const response = await getRequest(`/rentals/${rental._id}`, token)
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
    it('should delete a specific rental successfully', async () => {
      const rental = await createRental({
        rentalText: `${Date.now()}_Devworks  Bootcamp rental`,
        stars: 3,
        user: user.id,
        book: book.id,
      });
      // eslint-disable-next-line no-underscore-dangle
      const response = await deleteRequest(`/rentals/${rental._id}`, token)
        .send({ inStock: 23 })
        .expect(202);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('success');
      expect(resp_data.success).to.be.an('boolean');
    });
  });
  describe('Negative Tests', () => {
    it('should not rental a book successfully, rentalText is missing', async () => {
      const response = await postRequest('/rentals', token)
        .send({
          stars: 3,
          user: user.id,
          book: book.id,
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
      expect(resp_data.error).to.equal(`ValidationError: "rentalText" is required`);
    });
    it('should not rental a book successfully, invalid book ID', async () => {
      const objID = new ObjectID();
      const response = await postRequest('/rentals', token)
        .send({
          rentalText: `${Date.now()}_Devworks  Bootcamp rental`,
          stars: 3,
          user: user.id,
          book: objID,
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
      expect(resp_data.error).to.equal(`Book with id: ${objID} is not in database`);
    });
    it('should not update a book rental successfully, invalid ID', async () => {
      const response = await putRequest('/rentals/eeeeeee', token)
        .send({
          rentalText: `${Date.now()}_Devworks  Bootcamp rental`,
          stars: 3,
          user: user.id,
          book: book.id,
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
    it('should not update a book rental successfully, no such rental ID', async () => {
      const objID = new ObjectID();
      const response = await putRequest(`/rentals/${objID}`, token)
        .send({
          rentalText: `${Date.now()}_Devworks  Bootcamp rental`,
          stars: 3,
          user: user.id,
          book: book.id,
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
      expect(resp_data.error).to.equal(`Rental with id: ${objID} does not exist on the database`);
    });
    it('should not like book rental successfully, no such rental ID', async () => {
      const objID = new ObjectID();
      const response = await putRequest(`/rentals/${objID}/likes`, token)
        .send({ action: 'like' })
        .expect(404);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('success');
      expect(resp_data).to.have.property('error');
      expect(resp_data.success).to.be.an('boolean');
      expect(resp_data.success).to.equal(false);
      expect(resp_data.error).to.be.an('string');
      // eslint-disable-next-line quotes
      expect(resp_data.error).to.equal(`Rental with id: ${objID} does not exist on the database`);
    });
    it('should not like book rental successfully, invalid like action', async () => {
      const rental = await createRental({
        rentalText: `${Date.now()}_Devworks  Bootcamp rental`,
        stars: 3,
        user: user.id,
        book: book.id,
      });
      // eslint-disable-next-line no-underscore-dangle
      const response = await putRequest(`/rentals/${rental._id}/likes`, token)
        .send({ action: 'likee' })
        .expect(400);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('success');
      expect(resp_data).to.have.property('error');
      expect(resp_data.success).to.be.an('boolean');
      expect(resp_data.success).to.equal(false);
      expect(resp_data.error).to.be.an('string');
      // eslint-disable-next-line quotes
      expect(resp_data.error).to.equal(`Invalid action`);
    });
    it('should not get book successfully, no such rental ID', async () => {
      const objID = new ObjectID();
      const response = await getRequest(`/rentals/${objID}`, token)
        .expect(404);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('success');
      expect(resp_data).to.have.property('error');
      expect(resp_data.success).to.be.an('boolean');
      expect(resp_data.success).to.equal(false);
      expect(resp_data.error).to.be.an('string');
      // eslint-disable-next-line quotes
      expect(resp_data.error).to.contain(`Rental with id: ${objID} does not exist on the database`);
    });
    it('should not delete book successfully, no such rental ID', async () => {
      const objID = new ObjectID();
      const response = await deleteRequest(`/rentals/${objID}`, token)
        .expect(404);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('success');
      expect(resp_data).to.have.property('error');
      expect(resp_data.success).to.be.an('boolean');
      expect(resp_data.success).to.equal(false);
      expect(resp_data.error).to.be.an('string');
      // eslint-disable-next-line quotes
      expect(resp_data.error).to.contain(`Rental with id: ${objID} does not exist on the database`);
    });
  });
  // eslint-disable-next-line func-names
  after(async function () {
    this.timeout(10000);
    userToDelete = await fetchUser({ username: user.username });
    if (userToDelete) { await destroyUser(userToDelete.id, true); }
  });
});

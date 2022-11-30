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
const {
  createRental, updateRental, fetchRentals, destroyRental,
} = new RentalLib();

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
    it('should checkout a book successfully', async () => {
      const response = await postRequest('/rentals/checkout', token)
        .send(
          {
            dueDate: new Date('11/30/2022'),
            quantity: 1,
            book: book.id,
          },
        )
        .expect(201);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('success');
      expect(resp_data).to.have.property('data');
      expect(resp_data.success).to.be.an('boolean');
      expect(resp_data.data).to.be.an('object');
      expect(resp_data.data).to.have.property('_id');
      expect(resp_data.data).to.have.property('createdAt');
      expect(resp_data.data).to.have.property('updatedAt');
    });
    it('should edit a book rental successfully', async () => {
      const rental = await createRental({
        dueDate: new Date('11/30/2022'),
        quantity: 1,
        user: user.id,
        book: book.id,
      });
      // eslint-disable-next-line no-underscore-dangle
      const response = await putRequest(`/rentals/${rental._id}`, token)
        .send({ quantity: 3 })
        .expect(202);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('success');
      expect(resp_data).to.have.property('data');
      expect(resp_data.success).to.be.an('boolean');
      expect(resp_data.data).to.be.an('object');
      expect(resp_data.data).to.have.property('_id');
      expect(resp_data.data).to.have.property('createdAt');
      expect(resp_data.data).to.have.property('updatedAt');
      expect(resp_data.data.createdAt).to.not.equal(resp_data.data.updatedAt);
    });
    it('should checkin a book successfully', async () => {
      const rental = await createRental({
        dueDate: new Date('11/30/2022'),
        quantity: 1,
        user: user.id,
        book: book.id,
      });
      // eslint-disable-next-line no-underscore-dangle
      const response = await putRequest(`/rentals/${rental._id}/checkin`, token)
        .send()
        .expect(202);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('success');
      expect(resp_data).to.have.property('data');
      expect(resp_data.success).to.be.an('boolean');
      expect(resp_data.data).to.be.an('object');
      expect(resp_data.data).to.have.property('_id');
      expect(resp_data.data).to.have.property('createdAt');
      expect(resp_data.data).to.have.property('updatedAt');
      expect(resp_data.data.createdAt).to.not.equal(resp_data.data.updatedAt);
      expect(resp_data.data.isReturned).to.be.an('boolean');
      expect(resp_data.data.isReturned).to.equal(true);
    });
    it('should fetch all the rentals successfully', async () => {
      const response = await fetchRentals();

      expect(response).to.be.an('array');
    });
    it('should get all the rentals to a books successfully', async () => {
      await createRental({
        dueDate: new Date('11/30/2022'),
        quantity: 1,
        user: user.id,
        book: book.id,
      });
      await createRental({
        dueDate: new Date('11/30/2022'),
        quantity: 1,
        user: user.id,
        book: book.id,
      });
      const response = await getRequest('/rentals?select=dueDate&sort=dueDate&page=2&limit=1', token)
        .expect(200);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('success');
      expect(resp_data).to.have.property('totalCount');
      expect(resp_data).to.have.property('countOnPage');
      expect(resp_data).to.have.property('pagination');
      expect(resp_data).to.have.property('data');
      expect(resp_data.success).to.be.an('boolean');
      expect(resp_data.data).to.be.an('array');
    });
    it('should get most rented books successfully', async () => {
      await createRental({
        dueDate: new Date('11/30/2022'),
        quantity: 1,
        user: user.id,
        book: book.id,
      });
      await createRental({
        dueDate: new Date('11/30/2022'),
        quantity: 1,
        user: user.id,
        book: book.id,
      });
      const response = await getRequest('/rentals/books/most?page=2&limit=1', token)
        .expect(200);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('success');
      expect(resp_data).to.have.property('totalCount');
      expect(resp_data).to.have.property('countOnPage');
      expect(resp_data).to.have.property('pagination');
      expect(resp_data).to.have.property('data');
      expect(resp_data.success).to.be.an('boolean');
      expect(resp_data.data).to.be.an('array');
      expect(resp_data.pagination).to.have.property('next');
      expect(resp_data.pagination).to.have.property('prev');
    });
    it('should get all books a user rented successfully', async () => {
      // eslint-disable-next-line no-underscore-dangle
      const response = await getRequest(`/rentals/books/${user._id}`, token)
        .expect(200);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('success');
      expect(resp_data).to.have.property('data');
      expect(resp_data.success).to.be.an('boolean');
      expect(resp_data.data).to.be.an('array');
    });
    it('should get a specific rental successfully', async () => {
      const rental = await createRental({
        dueDate: new Date('11/30/2022'),
        quantity: 1,
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
      expect(resp_data.data).to.be.an('object');
      expect(resp_data.data).to.have.property('_id');
    });
    it('should delete a specific rental successfully', async () => {
      const rental = await createRental({
        dueDate: new Date('11/30/2022'),
        quantity: 1,
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
    it('should not rent a book successfully, dueDate is missing', async () => {
      const response = await postRequest('/rentals/checkout', token)
        .send({
          quantity: 1,
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
      expect(resp_data.error).to.equal(`ValidationError: "dueDate" is required`);
    });
    it('should not rent a book successfully, invalid book ID', async () => {
      const objID = new ObjectID();
      const response = await postRequest('/rentals/checkout', token)
        .send({
          dueDate: new Date('11/30/2022'),
          quantity: 1,
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
          dueDate: new Date('11/30/2022'),
          quantity: 1,
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
          dueDate: new Date('11/30/2022'),
          quantity: 1,
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
    it('should not be able to checkin a book rental successfully, no such rental ID', async () => {
      const objID = new ObjectID();
      const response = await putRequest(`/rentals/${objID}/checkin`, token)
        .send()
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
    // eslint-disable-next-line func-names
    it('should not be able to checkin a book rental successfully, user not authorized cause wrong user', async function () {
      this.timeout(10000);
      const dummyUserData = {
        username: `${Date.now()}_kufre`,
        firstname: `${Date.now()}_Kufre`,
        lastname: `${Date.now()}_Okon`,
        email: `${Date.now()}_book.example@example.com`,
        password: 'Test1234',
      };
      const password = await hashPassword(dummyUserData.password);
      const dummyUser = await createUser({ ...dummyUserData, password });
      const rental = await createRental({
        dueDate: new Date('11/30/2022'),
        quantity: 1,
        user: dummyUser.id,
        book: book.id,
      });
      // eslint-disable-next-line no-underscore-dangle
      const response = await putRequest(`/rentals/${rental._id}/checkin`, token)
        .send()
        .expect(401);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('success');
      expect(resp_data).to.have.property('error');
      expect(resp_data.success).to.be.an('boolean');
      expect(resp_data.success).to.equal(false);
      expect(resp_data.error).to.be.an('string');
      // eslint-disable-next-line quotes
      expect(resp_data.error).to.equal(`User: ${user.id} does not have authorization to checkout this rental`);
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
    it('should just throw an error, createRental', async () => {
      await expect(createRental(333)).to.eventually.be.rejectedWith('ValidationError: user: Path `user` is required., book: Path `book` is required., dueDate: Path `dueDate` is required.');
    });
    it('should just throw an error, updateRental', async () => {
      await expect(updateRental(333)).to.eventually.be.rejectedWith('Cast to ObjectId failed for value "333" (type number) at path "_id" for model "rental"');
    });
    it('should just throw an error, destroyRental', async () => {
      await expect(destroyRental({ _id: 333 })).to.eventually.be.rejectedWith('Cast to ObjectId failed for value "333" (type number) at path "_id" for model "rental"');
    });
  });
  // eslint-disable-next-line func-names
  after(async function () {
    this.timeout(10000);
    userToDelete = await fetchUser({ username: user.username });
    if (userToDelete) { await destroyUser(userToDelete.id, true); }
  });
});

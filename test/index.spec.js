const {
  app, request, expect, getRequest,
} = require('./common.spec');

describe('Index Test', () => {
  describe('Positive Tests', () => {
    // eslint-disable-next-line func-names
    it('should go to index', async function () {
      this.timeout(10000);
      const response = await getRequest('/')
        .expect(200);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('message');
      expect(resp_data.message).to.be.an('string');
      expect(resp_data.message).to.equal('Welcome to the Book-Rental-Store API');
    });
  });

  describe('Negative Tests', () => {
    it('should not find route', async () => {
      const response = await getRequest('/undefined')
        .expect(404);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('message');
      expect(resp_data.message).to.be.an('string');
      expect(resp_data.message).to.equal('Invalid request, Route does not exist');
    });
    it('should not be authorized catch', async () => {
      const response = await getRequest('/books')
        .expect(401);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('success');
      expect(resp_data).to.have.property('error');
      expect(resp_data.success).to.be.an('boolean');
      expect(resp_data.success).to.equal(false);
      expect(resp_data.error).to.be.an('string');
      expect(resp_data.error).to.equal('Not authorized to access this route');
    });
    it('should not be authorized', async () => {
      const response = await request(app).get('/api/v1/books')
        .expect(401);

      const resp_data = response.body;
      expect(resp_data).to.be.an('object');
      expect(resp_data).to.have.property('success');
      expect(resp_data).to.have.property('error');
      expect(resp_data.success).to.be.an('boolean');
      expect(resp_data.success).to.equal(false);
      expect(resp_data.error).to.be.an('string');
      expect(resp_data.error).to.equal('Not authorized to access this route');
    });
  });
});

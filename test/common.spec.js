const request = require('supertest');
const url = require('url');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { app } = require('../server');

chai.use(chaiAsPromised);
const { expect } = chai;

const getRequest = (route, token) => request(app)
  .get(`/api/v1${route}`)
  .set('Authorization', `Bearer ${token}`)
  .set('Accept', 'application/json');
const postRequest = (route, token) => request(app)
  .post(`/api/v1${route}`)
  .set('Authorization', `Bearer ${token}`)
  .set('Accept', 'application/json');
const putRequest = (route, token) => request(app)
  .put(`/api/v1${route}`)
  .set('Authorization', `Bearer ${token}`)
  .set('Accept', 'application/json');
const deleteRequest = (route, token) => request(app)
  .delete(`/api/v1${route}`)
  .set('Authorization', `Bearer ${token}`)
  .set('Accept', 'application/json');
module.exports = {
  expect,
  app,
  url,
  request,
  getRequest,
  postRequest,
  putRequest,
  deleteRequest,
};

const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert(user === expectedUserID);
  });

  it('should return undefined with an invalid email', function() {
    const result = getUserByEmail("null@example.com", testUsers);
    assert(result === undefined);
  });
});

// HTTP server tests
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;

chai.use(chaiHttp);

describe("Login and Access Control Test", () => {
  it('should return 403 status code for unauthorized access to "http://localhost:8080/urls/b6UTxQ"', () => {
    const agent = chai.request.agent("http://localhost:8080");

    // Step 1: Login with valid credentials
    return agent
      .post("/login")
      .send({ email: "user2@example.com", password: "dishwasher-funk" })
      .then((loginRes) => {
        // Step 2: Make a GET request to a protected resource
        return agent.get("/urls/b6UTxQ").then((accessRes) => {
          // Step 3: Expect the status code to be 403
          expect(accessRes).to.have.status(403);
        });
      });
  });
});

describe('GET Path Tests While Not Logged In', () => {
  const agent = chai.request.agent('http://localhost:8080');

  it('should redirect GET / to /login with status code 302', () => {
    return agent
      .get('/')
      .then((res) => {
        expect(res).to.redirect;
        expect(res.redirects[0]).to.equal('http://localhost:8080/login');
      });
  });

  it('should redirect GET /urls/new to /login with status code 302', () => {
    return agent
      .get('/urls/new')
      .then((res) => {
        expect(res).to.redirect;
        expect(res.redirects[0]).to.equal('http://localhost:8080/login');
      });
  });

  it('should return status code 404 for GET /urls/NOTEXISTS', () => {
    return agent
      .get('/urls/NOTEXISTS')
      .then((res) => {
        expect(res).to.have.status(404);
      });
  });

  it('should return status code 403 for GET /urls/b6UTxQ', () => {
    return agent
      .get('/urls/b6UTxQ')
      .then((res) => {
        expect(res).to.have.status(403);
      });
  });

  // Cleanup agent after all tests
  after(() => {
    agent.close();
  });
});

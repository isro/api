/**
 * Minimal req/res mocks for testing Vercel serverless handlers directly.
 * No HTTP server needed — handlers are just async functions.
 */

function mockReq(query = {}) {
  return { query };
}

function mockRes() {
  const res = {
    _status: 200,
    _body: null,
    _headers: {},
    status(code) {
      this._status = code;
      return this;
    },
    send(body) {
      this._body = body;
      return this;
    },
    setHeader(key, val) {
      this._headers[key] = val;
      return this;
    },
  };
  return res;
}

module.exports = { mockReq, mockRes };

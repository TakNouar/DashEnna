/**
 * Phase 1: unit tests for requireAuth, requireRoot, requirePage.
 * Run: npm test  (node --test)
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = 'development';
delete process.env.JWT_SECRET;

const {
  requireAuth,
  requireRoot,
  requirePage,
  signToken,
  JWT_SECRET,
} = require('../src/middleware/auth');

function mockRes() {
  const res = {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
  return res;
}

function call(mw, req) {
  return new Promise((resolve) => {
    const res = mockRes();
    let nextCalled = false;
    mw(req, res, () => {
      nextCalled = true;
      resolve({ res, nextCalled });
    });
    setImmediate(() => {
      if (!nextCalled) resolve({ res, nextCalled });
    });
  });
}

describe('requireAuth', () => {
  it('returns 401 when Authorization header missing', async () => {
    const { res, nextCalled } = await call(requireAuth, { headers: {} });
    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
  });

  it('returns 401 for invalid token', async () => {
    const { res, nextCalled } = await call(requireAuth, {
      headers: { authorization: 'Bearer not-a-jwt' },
    });
    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
  });

  it('calls next and sets req.user for valid token', async () => {
    const token = jwt.sign({ id: 1, username: 'root', role: 'root' }, JWT_SECRET, { expiresIn: '1h' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const { nextCalled } = await call(requireAuth, req);
    assert.equal(nextCalled, true);
    assert.equal(req.user.username, 'root');
  });
});

describe('requireRoot', () => {
  it('returns 403 for non-root', async () => {
    const { res, nextCalled } = await call(requireRoot, { user: { role: 'dsa' } });
    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 403);
  });

  it('calls next for root', async () => {
    const { nextCalled } = await call(requireRoot, { user: { role: 'root' } });
    assert.equal(nextCalled, true);
  });
});

describe('requirePage', () => {
  it('allows root any page', async () => {
    const { nextCalled } = await call(requirePage('accounts'), { user: { role: 'root' } });
    assert.equal(nextCalled, true);
  });

  it('allows dsa when page is in permissions', async () => {
    const req = { user: { role: 'dsa', permissions: { pages: ['incidents', 'equipment'] } } };
    const { nextCalled } = await call(requirePage('incidents'), req);
    assert.equal(nextCalled, true);
  });

  it('returns 403 when page not granted', async () => {
    const req = { user: { role: 'dsa', permissions: { pages: ['overview'] } } };
    const { res, nextCalled } = await call(requirePage('accounts'), req);
    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 403);
  });
});

describe('signToken', () => {
  it('produces a verifiable JWT', () => {
    const token = signToken({
      id: 2,
      username: 'DSA_Alger',
      role: 'dsa',
      dsa_region: 'DSA Alger (Centre)',
      permissions: { pages: ['overview'] },
    });
    const payload = jwt.verify(token, JWT_SECRET);
    assert.equal(payload.username, 'DSA_Alger');
  });
});

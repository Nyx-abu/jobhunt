#!/usr/bin/env node
// Fake ATS API server for CI smoke tests.
// Mocks Greenhouse/Ashby/Lever endpoints with canned responses.

import http from 'node:http';

const FAKE_JOBS = {
  '/greenhouse/langchain/jobs': {
    jobs: [
      { id: 1, title: 'Software Engineer, Forward Deployed', location: { name: 'Remote' }, absolute_url: 'https://fake/jobs/1' },
      { id: 2, title: 'Junior Backend Engineer', location: { name: 'Remote — Global' }, absolute_url: 'https://fake/jobs/2' },
    ],
  },
  '/ashby/resend/jobs': {
    jobBoard: {
      jobPostings: [
        { id: 'a1', title: 'Platform Engineer', location: 'Remote', jobUrl: 'https://fake/jobs/a1' },
      ],
    },
  },
};

const server = http.createServer((req, res) => {
  const body = FAKE_JOBS[req.url];
  if (body) {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify(body));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const PORT = process.env.FAKE_PORTALS_PORT || 9876;
server.listen(PORT, () => {
  console.log(`Fake portals server on http://localhost:${PORT}`);
});

process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());

#!/usr/bin/env node

const https = require('https');

const TASK_MANAGER_URL = process.env.TASK_MANAGER_URL;
const EMAIL = process.env.TASK_MANAGER_EMAIL;
const PASSWORD = process.env.TASK_MANAGER_PASSWORD;

const taskDescription = process.argv.slice(2).join(' ');

if (!taskDescription) {
  console.error('❌ Error: Please provide a task description.');
  console.log('Example: node cli/create-task.js "Submit project report tomorrow"');
  process.exit(1);
}

if (!TASK_MANAGER_URL || !EMAIL || !PASSWORD) {
  console.error('❌ Error: Please set TASK_MANAGER_URL, TASK_MANAGER_EMAIL, and TASK_MANAGER_PASSWORD environment variables.');
  process.exit(1);
}

// A simple function to make HTTPS requests with promises
const request = (options, data) => {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          // Extract cookies for session management
          const cookies = res.headers['set-cookie'];
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: JSON.parse(body),
            cookies,
          });
        } catch (e) {
          resolve({ // Resolve even on JSON parse error to see non-JSON body
            statusCode: res.statusCode,
            headers: res.headers,
            body: body,
          });
        }
      });
    });
    req.on('error', (e) => reject(e));
    if (data) {
      req.write(data);
    }
    req.end();
  });
};

const main = async () => {
  try {
    console.log('🔐 Authenticating...');
    
    // 1. Get CSRF Token
    const baseUrl = new URL(TASK_MANAGER_URL);
    const csrfUrl = new URL('/api/auth/csrf', baseUrl);
    const csrfRes = await request({
      method: 'GET',
      hostname: csrfUrl.hostname,
      path: csrfUrl.pathname,
      port: csrfUrl.port || 443,
    });
    
    if(csrfRes.statusCode !== 200 || !csrfRes.body.csrfToken) {
        throw new Error(`Failed to get CSRF token. Status: ${csrfRes.statusCode}, Body: ${JSON.stringify(csrfRes.body)}`);
    }
    
    const csrfToken = csrfRes.body.csrfToken;
    const csrfCookie = csrfRes.cookies.find(c => c.startsWith('next-auth.csrf-token')).split(';')[0];

    // 2. Sign In
    const signInUrl = new URL('/api/auth/callback/credentials', baseUrl);
    const postData = new URLSearchParams({
      email: EMAIL,
      password: PASSWORD,
      csrfToken: csrfToken,
      json: 'true',
    }).toString();

    const signInRes = await request({
      method: 'POST',
      hostname: signInUrl.hostname,
      path: signInUrl.pathname,
      port: signInUrl.port || 443,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'Cookie': csrfCookie,
      },
    }, postData);
    
    if (signInRes.statusCode !== 200) {
        throw new Error(`Authentication failed. Status: ${signInRes.statusCode}, Body: ${JSON.stringify(signInRes.body)}`);
    }

    const sessionCookie = signInRes.cookies.find(c => c.startsWith('next-auth.session-token')).split(';')[0];
    console.log('✅ Authentication successful.');

    // 3. Call AI Chat Endpoint
    console.log(`🤖 Sending task to AI assistant: "${taskDescription}"`);
    const chatUrl = new URL('/api/chat', baseUrl);
    const chatData = JSON.stringify({ message: taskDescription });

    const chatRes = await request({
      method: 'POST',
      hostname: chatUrl.hostname,
      path: chatUrl.pathname,
      port: chatUrl.port || 443,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(chatData),
        'Cookie': sessionCookie,
      },
    }, chatData);

    if (chatRes.statusCode !== 200) {
      throw new Error(`AI request failed. Status: ${chatRes.statusCode}, Body: ${JSON.stringify(chatRes.body)}`);
    }

    console.log(`💬 AI Response: "${chatRes.body.response}"`);
    if (chatRes.body.actionTaken) {
      console.log('✅ Task created successfully!');
    } else {
      console.log('ℹ️ AI processed the command without creating a task.');
    }

  } catch (error) {
    console.error('❌ An error occurred:', error.message);
    process.exit(1);
  }
};

main();
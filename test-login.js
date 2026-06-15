const axios = require('axios');

async function testLogin() {
  try {
    const res = await axios.post('http://127.0.0.1:3000/api/auth/login', {
      email: 'lokeek.innonsh@gmail.com',
      password: 'testpassword123',
      role: 'parent'
    });
    console.log("SUCCESS:", res.data);
  } catch (err) {
    console.log("ERROR STATUS:", err.response?.status);
    console.log("ERROR DATA:", err.response?.data);
  }
}

testLogin();

const axios = require('axios');

async function runTest() {
  const baseURL = 'http://localhost:5000/api/v1';
  console.log(`Testing API at: ${baseURL}`);
  
  try {
    // 1. Login with student account
    console.log("Logging in...");
    const loginRes = await axios.post(`${baseURL}/access/login`, {
      email: 'student@sdn.com',
      password: 'password123'
    });
    
    console.log("Login response data:", JSON.stringify(loginRes.data, null, 2));
    const user = loginRes.data.metadata?.user;
    const userId = user?._id;
    const token = loginRes.data.metadata?.tokens?.accessToken;
    console.log("Logged in successfully. User ID:", userId, "Token:", token ? "Exists" : "Not Found");
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'x-client-id': userId
    };

    // 2. Fetch Reading exams
    console.log("Fetching READING exams...");
    const readingRes = await axios.get(`${baseURL}/exams?type=READING`, { headers });
    
    const readingExams = readingRes.data.data.exams;
    console.log(`Found ${readingExams.length} Reading exams:`);
    readingExams.forEach(e => {
      console.log(`  - ${e.title} (${e.duration} min, ${e.questionsCount} questions)`);
    });
    
    // 3. Fetch Listening exams
    console.log("Fetching LISTENING exams...");
    const listeningRes = await axios.get(`${baseURL}/exams?type=LISTENING`, { headers });
    
    const listeningExams = listeningRes.data.data.exams;
    console.log(`Found ${listeningExams.length} Listening exams:`);
    listeningExams.forEach(e => {
      console.log(`  - ${e.title} (${e.duration} min, ${e.questionsCount} questions)`);
    });
    
  } catch (err) {
    console.error("API test failed:", err.response ? err.response.data : err.message);
  }
}

runTest();

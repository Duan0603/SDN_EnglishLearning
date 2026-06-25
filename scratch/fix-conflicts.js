const fs = require('fs');
const files = [
  'README.md',
  'frontend/src/screens/AdminScreen.js',
  'frontend/src/screens/ExamScreen.js',
  'frontend/src/screens/HomeScreen.js',
  'frontend/src/screens/PracticeScreen.js',
  'frontend/src/screens/ProfileScreen.js',
  'frontend/src/screens/RegisterScreen.js'
];

for (const file of files) {
  if (!fs.existsSync(file)) {
      console.log('Not found', file);
      continue;
  }
  let content = fs.readFileSync(file, 'utf8');
  
  // Regex to match <<<<<<< HEAD ... ======= ... >>>>>>> [commit/branch]
  // and keep only the HEAD part (group 1)
  const regex = /<<<<<<< HEAD\r?\n([\s\S]*?)\r?\n=======\r?\n[\s\S]*?\r?\n>>>>>>> [^\r\n]+\r?\n?/g;
  
  content = content.replace(regex, '$1\n');
  fs.writeFileSync(file, content);
  console.log('Fixed', file);
}

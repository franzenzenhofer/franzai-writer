const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/query-client.ts');

try {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log('Successfully removed query-client.ts');
  } else {
    console.log('File does not exist');
  }
} catch (error) {
  console.error('Error removing file:', error);
}
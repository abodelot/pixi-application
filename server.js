const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.static(path.join(__dirname, './dist')));
app.listen(PORT, (x) => {
  console.log(`Listening on port ${PORT}...`);
});

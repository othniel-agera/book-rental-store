require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(`${process.env.DB_URI}/${process.env.DB_NAME}`).then(() => {
  console.log('Database connection successful');
}).catch((err) => {
  console.log('Database conection failed', err);
});

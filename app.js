const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const indexRouter = require('./routes/index');
const app = express();
const PORT = process.env.PORT || 5000;

require('dotenv').config();
app.use(cors());
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json())  // req.body가 객체로 인식이 되기때문에

app.use('/api', indexRouter)

// const mongoURI = process.env.LOCAL_DB_ADDRESS;
const mongoURI = process.env.PROD_DB_ADDRESS;
mongoose
  .connect(mongoURI)
  .then(() => console.log('mongoose connected'))
  .catch((error) => console.log('DB connected fail',error));

app.listen(PORT,() => {
  console.log(`Server ON ${PORT}`);
});

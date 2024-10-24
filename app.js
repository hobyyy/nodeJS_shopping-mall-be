const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

require('dotenv').config();
app.use(cors());
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json())  // req.body가 객ㅔ로 인식이 되기때문에

const mongoURI = process.env.LOCAL_DB_ADDRESS;
mongoose
  .connect(mongoURI)
  .then(() => console.log('mongoose connected'))
  .catch((error) => console.log('DB connected fail',error));

app.listen(process.env.PORT || 5000,() => {
  console.log('Server ON',);
});

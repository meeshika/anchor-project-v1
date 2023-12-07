const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require('dotenv').config();

const videoRoutes = require("./api/routes/video");

const PORT = process.env.PORT || 3000;
const mongo_uri = process.env.MONGO_URI;
mongoose.connect(mongo_uri,   {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB!!!');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

mongoose.Promise = global.Promise;

app.use(morgan("dev"));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

app.use("/video", videoRoutes);
app.get("/",(req,res)=>{
  return res.status(200).json({message:"api connected succefully"})
})

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});


app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

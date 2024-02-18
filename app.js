const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const dbConnect = require('./db/dbConnect');
const bcrypt = require('bcrypt');
const User = require('./db/userModel');
const jwt = require('jsonwebtoken');
const auth = require("./auth");

// body parser configuration
app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (request, response, next) => {
  response.json({ message: "Hey! This is your server response!" });
  next();
});

//curb cores error by adding a header here
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );

  next();
})

dbConnect();

// register endpoint
app.post("/register", async (request, response) => {
  try {
    // hash the password
    const hashedPassword = await bcrypt.hash(request.body.password, 10);
    
    // create a new user instance and collect the data
    const user = new User({
      email: request.body.email,
      password: hashedPassword,
    });

    // save the new user
    const result = await user.save();

    // return success if the new user is added to the database successfully
    response.status(201).send({
      message: "User Created Successfully",
      result,
    });
  } catch (error) {
    // handle errors
    response.status(500).send({
      message: "Error creating user",
      error,
    });
  }
});

app.post("/login", (request, response) => {
  User.findOne({ email: request.body.email })
  .then((user) => {
    bcrypt.compare(request.body.password, user.password)
    .then((passwordCheck) => {
      if(!passwordCheck){
        return response.status(400).send({
          message: "Passwords does not match",
          error,
        })
      }

      // create JWT Token

      const token = jwt.sign({
        userId: user._id,
        userEmail: user.email,
      },
      "RANDOM-TOKEN",
      {
        expiresIn: "24h"
      }
      );

      // return success response
      response.status(200).send({
        message: "Login successful",
        email: user.email,
        token,
      })
    })
    // catch error if password does not match
    .catch((error) => {
      response.status(400).send({
        message: "Passwords does not match",
        error,
      })
    })
  })
  // catch error if email does not exist
  .catch((e)=> {
    response.status(404).send({
      message: "Email not found",
      e,
    })
  })
})

app.get("/free-endpoint", (request, response) => {
  response.json({
    message: "You are free to access me anytime"
  })
})

// authentication endpoint
app.get("/auth-endpoint", auth, (request, response) => {
  response.json({
    message: "You are authorized to access me"
  })
})

module.exports = app;

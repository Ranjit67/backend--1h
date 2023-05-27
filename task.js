// 1. Create a simple integration with any database with node.js
// 2. Use authentication with JWT access token
// 3. Implement refresh token functionality to renew the access token
// 4. Create a middleware for all api to authenticate the token
// 5. Also add a funcationality to authenticate API using API key (Aspire@123) - Program should authenticate API by satistfying one of the requirements that is API key or access token.1. Create a simple integration with any database with node.js 2. Use authentication with JWT access token 3. Implement refresh token functionality to renew the access token 4. Create a middleware for all api to authenticate the token
// 6. Also add a funcationality to authenticate API using API key (Aspire@123) - Program should authenticate API by satistfying one of the requirements that is API key or access token.

const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const mongoose = require("mongoose");
(() => {
  const uri =
    "mongodb+srv://ranjit_9:u2G43HrtRyBsG8ea@cluster0.y5crp.mongodb.net/InterviewDB?retryWrites=true&w=majority";

  mongoose
    .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((error) => {
      console.error("Error connecting to MongoDB:", error);
    });
})();
const userSchema = new mongoose.Schema({
  userName: String, // String is shorthand for {type: String}
  password: String, // String is shorthand for {type: String}
});
const userModel = mongoose.model("User", userSchema);

const secret = "hfdksjhfkjdshfdkjshf dskjhfkjdshf kjdsfhkj dshjfdshfhdsjkfh ";
const REsecret =
  "hfdksjhfkjdshfdkjshf dskjhfkjdshf kjdsfhkj dshjfdshfhdsjkfhFGDSHJDSH FDGSHFGHJSGJDSGDSJ ";
//data = {id:id}
const tokenSignIn = (data) => {
  const token = jwt.sign(data, secret, {
    expiresIn: 300, // expires in 24 hours
  });
  return token;
};
const tokenVerify = (token) => {
  const decode = jwt.verify(token, secret);
  return decode;
};
const reTokenSignIn = (data) => {
  const token = jwt.sign(data, REsecret, {
    expiresIn: 86400, // expires in 24 hours
  });
  return token;
};
const reTokenVerify = (token) => {
  const decode = jwt.verify(token, REsecret);
  return decode;
};

const middle = (req, res, next) => {
  try {
    var bearerHeader = req.headers["authorization"];
    // error handel
    var bearer = bearerHeader.split(" ");
    token = bearer[1];
    const decode = tokenVerify(token);
    req.payload = decode.payload;
    next();
  } catch (error) {
    next(error);
  }
};

app.post("/register", async (req, res, next) => {
  try {
    // const {userName,password} = req.body
    const createUser = await userModel.create({
      ...req.body,
    });
    // const token = tokenSignIn({ payload: { id: 89 } });
    const token = tokenSignIn({ payload: createUser });
    const refTokenGenerate = reTokenSignIn({ payload: createUser });
    res.json({
      success: {
        accessToken: token,
        refreshToken: refTokenGenerate,
        data: createUser,
        // result,
      },
    });
  } catch (error) {
    next(error);
  }
});
app.post("/login", async (req, res, next) => {
  try {
    // const {userName,password} = req.body
    const findUser = await userModel.findOne({
      ...req.body,
    });
    // const token = tokenSignIn({ payload: { id: 89 } });
    const token = tokenSignIn({ payload: findUser });
    // const result = tokenVerify(token);
    const refTokenGenerate = reTokenSignIn({ payload: findUser });
    res.json({
      success: {
        findUser,
        accessToken: token,
        refreshToken: refTokenGenerate,
      },
    });
  } catch (error) {
    next(error);
  }
});

app.post("/re-token-token-get", middle, (req, res, next) => {
  try {
    const { refToken } = req.body;
    const refData = reTokenVerify(refToken);

    const token = tokenSignIn({ payload: refData });

    const refTokenGenerate = reTokenSignIn({ payload: refData });

    res.json({
      success: {
        accessToken: token,
        refreshToken: refTokenGenerate,
      },
    });
  } catch (error) {
    next(error);
  }
});
app.get("/token-check", middle, (req, res, next) => {
  try {
    const userData = req.payload;
    console.log(req.payload);
    res.json({
      success: {
        data: userData,
      },
    });
  } catch (error) {
    next(error);
  }
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Something went wrong.",
    },
  });
});

app.listen(8080, () => {
  console.log("http://localhost:8080");
});

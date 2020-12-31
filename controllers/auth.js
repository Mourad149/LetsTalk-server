const Coach = require("../models/coach");
const Participant = require("../models/participant");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signUp = (req, res, next) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const age = req.body.age;
  const country = req.body.country;
  const currentPosition = req.body.currentPosition;
  const mail = req.body.mail;
  const password = req.body.password;
  const userType = req.body.userType;

  bcrypt
    .hash(password, 12)
    .then((hashedPw) => {
      if (userType === "coach") {
        const coach = new Coach({
          firstName: firstName,
          lastName: lastName,
          age: age,
          country: country,
          currentPosition: currentPosition,
          mail: mail,
          password: hashedPw,
        });
        return coach.save();
      } else if (userType === "participant") {
        const participant = new Participant({
          firstName: firstName,
          lastName: lastName,
          age: age,
          country: country,
          currentPosition: currentPosition,
          mail: mail,
          password: hashedPw,
        });
        return participant.save();
      }
    })
    .then((result) => {
      res.status(201).json({ message: "SUCCESS", userId: result._id });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.login = (req, res, next) => {
  const mail = req.body.mail;
  const password = req.body.password;
  let loadedUser;
  Participant.findOne({ mail: mail })
    .then((participant) => {
      if (!participant) {
        Coach.findOne({ mail: mail }).then((coach) => {
          if (!coach) {
            const error = new Error(
              "A user with this email could not be found."
            );
            error.statusCode = 401;
            throw error;
          }
          loadedUser = coach;
          return bcrypt.compare(password, coach.password);
        });
      }
      loadedUser = participant;
      return bcrypt.compare(password, participant.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error("Wrong password!");
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        {
          mail: loadedUser.mail,
          userId: loadedUser._id.toString(),
        },
        "somesupersecretsecret",
        { expiresIn: "1h" }
      );
      res.status(200).json({ token: token, userId: loadedUser._id.toString() });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

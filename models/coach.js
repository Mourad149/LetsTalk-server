const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const coachSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    age: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    currentPosition: {
      type: String,
      required: true,
    },
    mail: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: 'New',
    },
    meetings: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Meeting',
      },
    ],
    userType: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coach', coachSchema);

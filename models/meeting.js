const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const meetingSchema = new Schema(
  {
    theme: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    hostId: {
      type: String,
      required: true,
    },
    participants: {
      type: Number,
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    messages: {
      type: Array,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Meeting', meetingSchema);

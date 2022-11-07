const mongoose = require('mongoose');

const { Schema } = mongoose;

const BookSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    authorInformation: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    dimension: {
      height: {
        type: String,
        required: true,
      },
      width: {
        type: String,
        required: true,
      },
    },
    pricing: {
      dailyRental: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('book', BookSchema);

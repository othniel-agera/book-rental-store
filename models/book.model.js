const mongoose = require('mongoose');

const { Schema } = mongoose;

const BookSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
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
      required: true,
    },
    dimension: {
      height: {
        type: Number,
        required: true,
      },
      width: {
        type: Number,
        required: true,
      },
      unitOfMeasurement: {
        type: String,
        required: true,
      },
    },
    pricing: {
      dailyRate: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        required: true,
      },
    },
    quantity: {
      inStock: {
        type: Number,
        default: 1,
      },
      rentedOut: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  },
);

/* delete all reviews when book is deleted */

module.exports = mongoose.model('book', BookSchema);

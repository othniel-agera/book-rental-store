const mongoose = require('mongoose');

const { Schema } = mongoose;

const ReviewSchema = new Schema(
  {
    reviewText: {
      type: String,
      required: true,
    },
    stars: {
      type: Number,
      default: 5,
      min: [1, 'It must be at least 1 star'],
      max: [5, 'It must not be more than 5 stars'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    book: {
      type: Schema.Types.ObjectId,
      ref: 'book',
      required: true,
    },
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'user',
    }],
  },
  {
    timestamps: true,
  },
);

// eslint-disable-next-line func-names
ReviewSchema.virtual('likes').get(function () {
  return this.likes.length;
});

module.exports = mongoose.model('review', ReviewSchema);

const mongoose = require('mongoose');
const moment = require('moment');

const { Schema } = mongoose;

const RentalSchema = new Schema(
  {
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
    dueDate: {
      type: Date,
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    isReturned: {
      type: Boolean,
      default: false,
    },
    dateOfReturn: {
      type: Date,
    },
    charge: {
      amount: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        default: 'NGN',
      },
    },
  },
  {
    timestamps: true,
  },
);

// eslint-disable-next-line func-names
RentalSchema.pre('save', async function (next) {
  const book = await this.model('book').findOne(this.book);

  this.charge = {
    amount: book.pricing.dailyRate * moment(this.dueDate).diff(moment().startOf('day'), 'day') * this.quantity,
    currency: book.pricing.currency,
  };
  next();
});

module.exports = mongoose.model('rental', RentalSchema);

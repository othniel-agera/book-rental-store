const { celebrate, Joi, Segments } = require('celebrate');
const { isValidObjectId } = require('./utility.util');

class Validator {
  // Validators for auth routes
  static signupValidator = celebrate({
    [Segments.BODY]: Joi.object().keys({
      username: Joi.string().required().messages({ 'string.empty': 'Username required' }),
      firstname: Joi.string().required().messages({ 'string.empty': 'Firstname required' }),
      lastname: Joi.string().required(),
      email: Joi.string().email().required().trim()
        .lowercase(),
      password: Joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/).required().label('Password')
        .messages({
          'string.min': '{#label} Must have at least 8 characters',
          'string.pattern.base': '{#label} must include at least eight characters, one uppercase and lowercase letter and one number',
        }),
    }),
  });

  static loginValidator = celebrate({
    [Segments.BODY]: Joi.object().keys({
      email: Joi.string().email().required().trim()
        .lowercase(),
      password: Joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/).required().label('Password')
        .messages({
          'string.min': '{#label} Must have at least 8 characters',
          'string.pattern.base': '{#label} must include at least eight characters, one uppercase and lowercase letter and one number',
        }),
    }),
  });

  static updateDetailsValidator = celebrate({
    [Segments.BODY]: Joi.object().keys({
      username: Joi.string(),
      firstname: Joi.string(),
      lastname: Joi.string(),
    }),
  });

  // Validators for book routes
  static postBookValidator = celebrate({
    [Segments.BODY]: Joi.object().keys({
      title: Joi.string().required(),
      description: Joi.string().required(),
      subject: Joi.string().required(),
      authorInformation: Joi.string().required().custom((value, helper) => {
        if (!isValidObjectId(value)) return helper.message('Please enter a valid author ID');
        return value;
      }, 'ObjectID Validation'),
      dimension: Joi.object({
        height: Joi.number().positive().required(),
        width: Joi.number().positive().required(),
        unitOfMeasurement: Joi.string().required(),
      }),
      pricing: Joi.object({
        dailyRate: Joi.number().positive().required(),
        currency: Joi.string().required(),
      }),
      quantity: Joi.object({
        inStock: Joi.number().positive(),
        rentedOut: Joi.number().positive(),
      }),
    }),
  });

  static putBookValidator = celebrate({
    [Segments.BODY]: Joi.object().keys({
      title: Joi.string(),
      description: Joi.string(),
      subject: Joi.string(),
      authorInformation: Joi.string().custom((value, helper) => {
        if (!isValidObjectId(value)) return helper.message('Please enter a valid author ID');
        return value;
      }, 'ObjectID Validation'),
      dimension: Joi.object({
        height: Joi.number().positive(),
        width: Joi.number().positive(),
        unitOfMeasurement: Joi.string(),
      }),
      pricing: Joi.object({
        dailyRate: Joi.number().positive(),
        currency: Joi.string(),
      }),
      quantity: Joi.object({
        inStock: Joi.number().positive(),
        rentedOut: Joi.number().positive(),
      }),
    }),
  });

  static putInStockBookValidator = celebrate({
    [Segments.BODY]: Joi.object().keys({
      inStock: Joi.number().positive(),
    }),
  });

  // Validators for review routes
  static postReviewValidator = celebrate({
    [Segments.BODY]: Joi.object().keys({
      reviewText: Joi.string().required(),
      stars: Joi.number().max(5).min(1),
      user: Joi.string().required().custom((value, helper) => {
        if (!isValidObjectId(value)) return helper.message('Please enter a valid user ID');
        return value;
      }, 'ObjectID Validation'),
      book: Joi.string().required().custom((value, helper) => {
        if (!isValidObjectId(value)) return helper.message('Please enter a valid book ID');
        return value;
      }, 'ObjectID Validation'),
      likes: Joi.array().items(Joi.string().required().custom((value, helper) => {
        if (!isValidObjectId(value)) return helper.message('Please enter a valid user ID');
        return value;
      }, 'ObjectID Validation')),
    }),
  });

  static putReviewValidator = celebrate({
    [Segments.BODY]: Joi.object().keys({
      reviewText: Joi.string(),
      stars: Joi.number().max(5).min(1),
      user: Joi.string().custom((value, helper) => {
        if (!isValidObjectId(value)) return helper.message('Please enter a valid user ID');
        return value;
      }, 'ObjectID Validation'),
      book: Joi.string().custom((value, helper) => {
        if (!isValidObjectId(value)) return helper.message('Please enter a valid book ID');
        return value;
      }, 'ObjectID Validation'),
      likes: Joi.array().items(Joi.string().custom((value, helper) => {
        if (!isValidObjectId(value)) return helper.message('Please enter a valid user ID');
        return value;
      }, 'ObjectID Validation')),
    }),
  });

  // Validators for rental routes
  static postRentalValidator = celebrate({
    [Segments.BODY]: Joi.object().keys({
      user: Joi.string().required().custom((value, helper) => {
        if (!isValidObjectId(value)) return helper.message('Please enter a valid user ID');
        return value;
      }, 'ObjectID Validation'),
      book: Joi.string().required().custom((value, helper) => {
        if (!isValidObjectId(value)) return helper.message('Please enter a valid book ID');
        return value;
      }, 'ObjectID Validation'),
      dueDate: Joi.date().required(),
      quantity: Joi.number().positive(),
      isReturned: Joi.boolean(),
      charge: Joi.object({
        amount: Joi.number().positive().allow(0),
        currency: Joi.string(),
      }),
    }),
  });

  static putRentalValidator = celebrate({
    [Segments.BODY]: Joi.object().keys({
      user: Joi.string().custom((value, helper) => {
        if (!isValidObjectId(value)) return helper.message('Please enter a valid user ID');
        return value;
      }, 'ObjectID Validation'),
      book: Joi.string().custom((value, helper) => {
        if (!isValidObjectId(value)) return helper.message('Please enter a valid book ID');
        return value;
      }, 'ObjectID Validation'),
      dueDate: Joi.date(),
      quantity: Joi.number().positive(),
      isReturned: Joi.boolean(),
      charge: Joi.object({
        amount: Joi.number().positive().allow(0),
        currency: Joi.string(),
      }),
    }),
  });
}

module.exports = Validator;

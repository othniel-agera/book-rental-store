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
        if (!isValidObjectId(value)) return helper.message('Please enter a valid MongoDB Object ID');
        return value;
      }, 'ObjectID Validation'),
      dimension: Joi.object({
        height: Joi.number().required(),
        width: Joi.number().required(),
        unitOfMeasurement: Joi.string().required(),
      }),
      pricing: Joi.object({
        dailyRate: Joi.number().required(),
        currency: Joi.string().required(),
      }),
      quantity: Joi.object({
        inStock: Joi.number(),
        rentedOut: Joi.number(),
      }),
    }),
  });

  static putBookValidator = celebrate({
    [Segments.BODY]: Joi.object().keys({
      title: Joi.string(),
      description: Joi.string(),
      subject: Joi.string(),
      authorInformation: Joi.string().custom((value, helper) => {
        if (!isValidObjectId(value)) return helper.message('Please enter a valid MongoDB Object ID');
        return value;
      }, 'ObjectID Validation'),
      dimension: Joi.object({
        height: Joi.number(),
        width: Joi.number(),
        unitOfMeasurement: Joi.string(),
      }),
      pricing: Joi.object({
        dailyRate: Joi.number(),
        currency: Joi.string(),
      }),
      quantity: Joi.object({
        inStock: Joi.number(),
        rentedOut: Joi.number(),
      }),
    }),
  });

  static putInStockBookValidator = celebrate({
    [Segments.BODY]: Joi.object().keys({
      inStock: Joi.number(),
    }),
  });

  // Validators for review routes
  static postReviewValidator = celebrate({
    [Segments.BODY]: Joi.object().keys({
      reviewText: Joi.string().required(),
      stars: Joi.number().max(5).min(1),
      user: Joi.string().required().custom((value, helper) => {
        if (!isValidObjectId(value)) return helper.message('Please enter a valid MongoDB Object ID');
        return value;
      }, 'ObjectID Validation'),
      book: Joi.string().required().custom((value, helper) => {
        if (!isValidObjectId(value)) return helper.message('Please enter a valid MongoDB Object ID');
        return value;
      }, 'ObjectID Validation'),
      likes: Joi.array().items(Joi.string().required().custom((value, helper) => {
        if (!isValidObjectId(value)) return helper.message('Please enter a valid MongoDB Object ID');
        return value;
      }, 'ObjectID Validation')),
    }),
  });

  static putReviewValidator = celebrate({
    [Segments.BODY]: Joi.object().keys({
      reviewText: Joi.string().required(),
      stars: Joi.number().max(5).min(1),
      user: Joi.string().required().custom((value, helper) => {
        if (!isValidObjectId(value)) return helper.message('Please enter a valid MongoDB Object ID');
        return value;
      }, 'ObjectID Validation'),
      book: Joi.string().required().custom((value, helper) => {
        if (!isValidObjectId(value)) return helper.message('Please enter a valid MongoDB Object ID');
        return value;
      }, 'ObjectID Validation'),
      likes: Joi.array().items(Joi.string().required().custom((value, helper) => {
        if (!isValidObjectId(value)) return helper.message('Please enter a valid MongoDB Object ID');
        return value;
      }, 'ObjectID Validation')),
    }),
  });
}

module.exports = Validator;

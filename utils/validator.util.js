const { celebrate, Joi, Segments } = require('celebrate');

class Validator {
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
}
module.exports = Validator;

const Joi = require('joi')

module.exports = {
    createcheckpoint: Joi.object({
        checkpoint_name: Joi.string().required(),
        location_reference: Joi.string().optional(),
        is_privilege: Joi.optional(),
    }),
}
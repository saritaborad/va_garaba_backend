const Joi = require('joi')

module.exports = {
    createagency: Joi.object({
        name: Joi.string().required(),
        phone_number: Joi.number().required(),
        email: Joi.string().required(),
        instagram_id: Joi.string().trim().optional(),
        addresss: Joi.string().trim().optional(),
        garba_class_name: Joi.string().trim().optional(),
        agency_type: Joi.string().trim().optional(),
        gender: Joi.string().trim().optional(),
        blood_group: Joi.string().trim().optional(),
        birth_date: Joi.string().trim().optional(),
    }),
}
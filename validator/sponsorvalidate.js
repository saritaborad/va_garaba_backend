const Joi = require('joi')

module.exports = {
    createsponsor: Joi.object({
        name: Joi.string().required(),
        email: Joi.string().optional(),
        phone_number: Joi.number().required(),
        company_logo: Joi.optional(),
        company_name: Joi.string().optional(),
        profile_pic: Joi.string().optional(),
        authorized_person: Joi.string().optional(),
        authorized_person_photo: Joi.optional(),
        zone: Joi.optional(),
        parking: Joi.optional(),
        balance_alloted: Joi.number().optional(),
    }),
}
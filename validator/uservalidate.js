const Joi = require("joi")

module.exports = {
    userRegister: Joi.object({
        name: Joi.string().required(),
        phone_number: Joi.number().required(),
        roles: Joi.string().optional(),
        profile_pic: Joi.optional(),
        password: Joi.string().optional(),
        birth_date: Joi.string().optional(),
        blood_group: Joi.string().optional(),
        instagram_id: Joi.string().optional(),
        gender: Joi.string().optional(),
        android_device: Joi.optional(),
        ios_device: Joi.optional(),
        fcm_token: Joi.string().optional(),
        device_id: Joi.optional(),
        app_version: Joi.optional(),
        device_modal: Joi.optional(),
    }),
    userLogin: Joi.object({
        phone_number: Joi.number(),
    }).or('contact_number', 'email'),
}
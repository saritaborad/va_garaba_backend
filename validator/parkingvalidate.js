const Joi = require('joi')

module.exports = {
    createparking: Joi.object({
        parking_name: Joi.string().required(),
        slot: Joi.number().required(),
        price: Joi.required(),
        reserve_slot: Joi.number().optional(),
        color_code: Joi.string().optional(),
        pass_parking: Joi.boolean().optional(),
        two_wheeler_parking: Joi.boolean().optional(),
        car_parking: Joi.boolean().optional(),
        ticket_parking: Joi.boolean().optional(),
        location_reference: Joi.number().optional(),
        gates: Joi.optional(),
        is_privilege: Joi.optional(),
    }),
}
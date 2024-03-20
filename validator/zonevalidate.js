const Joi = require('joi')

module.exports = {
    createZone: Joi.object({
        zone_name: Joi.string().required(),
        location_reference: Joi.number().optional(),
        price: Joi.optional(),
        color_code: Joi.optional(),
        play_zone: Joi.boolean().optional(),
        pass_zone: Joi.boolean().optional(),
        ticket_zone: Joi.boolean().optional(),
        gates: Joi.optional(),
        checkpoints: Joi.optional(),
        is_privilege: Joi.optional(),
    }),
}
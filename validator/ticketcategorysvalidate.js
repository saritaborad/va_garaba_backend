const Joi = require('joi')

module.exports = {
    creatTicketcategory: Joi.object({
        ticket_name: Joi.string().required(),
        price: Joi.optional(),
        qty: Joi.number().optional(),
        ticket_sell: Joi.number().optional(),
        color_code: Joi.optional(),
        gates: Joi.array().required(),
        checkpoints: Joi.array().required(),
        zones: Joi.array().required(),
        is_privilege: Joi.optional(),
    }),
}
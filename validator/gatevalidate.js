const Joi = require('joi')

module.exports = {
    createGate: Joi.object({
        gate_name: Joi.string().required(),
        location_reference: Joi.string().optional(),
        is_privilege: Joi.optional(),
        is_main: Joi.optional(),
        entry_gate: Joi.optional(),
        parking_gate: Joi.optional(),
    }),
}
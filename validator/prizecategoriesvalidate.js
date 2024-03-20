const Joi = require('joi')

module.exports = {
        createPrizeCategroies: Joi.object({
        prize_name: Joi.string().trim().required(),
        type: Joi.string().optional(),
        prize_rank: Joi.number().optional().max(12),
        couple_flag: Joi.boolean().optional()
    }),
}
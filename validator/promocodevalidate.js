const Joi = require('joi')

module.exports = {
    createPromocode: Joi.object({
        promo_code: Joi.string().required(),
        discount_percentage: Joi.string().required(),
        max_discount: Joi.string().optional(),
        remark: Joi.string().optional(),
    }),
}
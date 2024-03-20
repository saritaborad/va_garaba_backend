const Joi = require('joi')

module.exports = {
    createJudge: Joi.object({
        judge_name: Joi.string().required(),
        judge_gender: Joi.string().required(),
        judge_blood_group: Joi.string().optional(),
        judge_phone_number: Joi.number().optional(),
        judge_photo: Joi.string().optional()
 }),
}
const Joi = require('joi')

module.exports = {
    creategarbaclass: Joi.object({
        garba_classname: Joi.string().required(),
        owner_name: Joi.string().required(),
        garba_class_email: Joi.string().trim().optional(),
        owner_profile_pic: Joi.optional(),
        branch_list: Joi.optional(),
        owner_email: Joi.optional(),
        zone_id: Joi.optional(),
        garba_class_logo: Joi.optional(),
        owner_contact_number: Joi.number().optional(),
        garba_class_since: Joi.string().trim().optional(),
        garba_class_address: Joi.string().trim().optional(),
        garba_class_area: Joi.string().trim().optional(),
        instagram_id: Joi.string().trim().optional(),
        branch_owner_name: Joi.string().trim().optional(),
        branch_address: Joi.string().trim().optional(),
        branch_mobile_number: Joi.string().trim().optional(),
        branch_area: Joi.string().trim().optional(),
        branch_name: Joi.string().trim().optional(),
        branch_authorized_name: Joi.string().trim().optional(),
        branch_authorized_contactnumber: Joi.string().trim().optional(),
    }),
}
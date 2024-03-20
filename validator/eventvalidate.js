const Joi = require('joi')

module.exports = {
    createEvent: Joi.object({
        event_name: Joi.string().required(),
        event_description: Joi.string().required(),
        event_band_name: Joi.string().trim().optional(),
        event_photo: Joi.optional(),
        event_location: Joi.string().trim().optional(),
        event_map: Joi.string().trim().optional(),
        event_time: Joi.string().trim().optional(),
        event_day: Joi.string().trim().optional(),
        event_date: Joi.string().trim().required(),
        youtube_link: Joi.string().trim().optional(),
        event_lattitude: Joi.string().trim().optional(),
        event_longitude: Joi.string().trim().optional(),
        ticketcategorys: Joi.optional(),
        taxes: Joi.optional(),
        is_duplicate: Joi.optional(),
        portrait_image: Joi.optional(),
        term_condition_Pdf: Joi.optional(),
        venue_pdf: Joi.optional(),
        selling: Joi.optional(),
    }),
}
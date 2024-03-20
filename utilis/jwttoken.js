let JWT = require('jsonwebtoken');
const allconfig = require('../config/allconfig');
const User = require('../models/users.model');

let JwtToken = async ({ user, statusCode, message = 'Something is Wrong!', res, status = 0 }) => {
    console.log({ user })
    const token = getJwtToken({ phone_number: user.phone_number });
    // const token = user.getJwtToken();

    const options = {
        expires: new Date(
            Date.now() + 2500 * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };
    if (user) {
        user = await User.findOneAndUpdate({ _id: user._id, is_deleted: false }, { token: token }, { new: true })
            .populate([
                {
                    path: 'garba_classes',
                    match: { _id: { $exists: true } },
                    select: '-createdAt -updatedAt',
                },
                {
                    path: 'owener_of_garba_class',
                    match: { _id: { $exists: true } },
                    select: '-createdAt -updatedAt',
                    populate: {
                        path: 'owner',
                        match: { _id: { $exists: true } },
                        select: '-createdAt -updatedAt',
                    }
                },
                {
                    path: 'owener_of_garba_class_branch',
                    match: { _id: { $exists: true } },
                    select: '-createdAt -updatedAt -parent',
                    populate: {
                        path: 'owner',
                        match: { _id: { $exists: true } },
                        select: 'phone_number profile_pic name gender',
                    }
                },
                {
                    path: 'my_parkings',
                    match: { _id: { $exists: true } },
                    select: '-createdAt -updatedAt -parent',
                    populate: [{
                        path: 'event',
                        match: { _id: { $exists: true } },
                        select: '-createdAt -updatedAt -parent -ticketcategorys',
                        populate: {
                            path: 'taxes',
                            match: { _id: { $exists: true } },
                            select: '-createdAt -updatedAt',
                        }
                    },
                    ]
                },
                {
                    path: 'pass_list',
                    match: { _id: { $exists: true } },
                    select: '-createdAt -updatedAt',
                    populate: [{
                        path: 'user zone garba_class',
                        match: { _id: { $exists: true } },
                        select: 'profile_pic name gender phone_number',
                        // select: '-createdAt -updatedAt -orders -my_parkings -token -garba_classes -pass_list -my_tickets',
                    },
                    {
                        path: 'parking',
                        match: { _id: { $exists: true } },
                        select: 'vehicle_number parking_name color_code',
                    }
                    ]
                },
                {
                    path: 'my_tickets',
                    match: { _id: { $exists: true } },
                    select: '-createdAt -updatedAt -parent -ticket_user',
                    populate: [
                        {
                            path: 'event',
                            match: { _id: { $exists: true } },
                            select: '-createdAt -updatedAt -parent -ticketcategorys',
                            populate: {
                                path: 'taxes',
                                match: { _id: { $exists: true } },
                                select: '-createdAt -updatedAt',

                            }
                        },
                        {
                            path: 'user',
                            match: { _id: { $exists: true } },
                            select: 'profile_pic name gender',

                        },
                        {
                            path: "zones gates checkpoints",
                            match: { _id: { $exists: true } },
                            select: '-createdAt -updatedAt',
                        }
                    ]
                },
            ])
            .select('-orders -order_parkings -order_tickets -pending_approval');

        // user = await User.findOne({ _id: user._id }).populate([...usercontroller.getUserPopulate])
        // .select('-orders -order_parkings -order_tickets -pending_approval');
    }
    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        data: user, status,
        token, message
    })
}

let getJwtToken = function ({ phone_number }) {

    return JWT.sign({ phone_number: phone_number }, allconfig.JWT_SECRET, { expiresIn: allconfig.JWT_EXPIRE })
}

module.exports = JwtToken;
const express = require('express')
const router = express.Router()
const {check, validationResult} = require('express-validator')
const gravatar = require('gravatar')
const User  = require('../../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
//@route post api/users
//@desc Register User
//@access public

router.post(
    '/',
    [
        check('name', 'Name is required')
            .not()
            .isEmpty(),
        check('email', 'Please include a valid email')
            .isEmail(),
        check('password', 'Please enter a pass with 6 or more char')
            .isLength({min: 6})
    ],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }

        const {name, email, password} = req.body

        try {
            let user = await User.findOne({email: email})
            if (user) {
                res.status(400).json({errors: [{msg: 'User already exists'}]})
            }
            // get users gravatar
            const avatar  = gravatar.url(email,{
                s: '200',
                r: 'pg',
                d: 'mm'
            })

            //create new User
            user = new User({
                name,
                email,
                avatar,
                password
            })

            //encrypt password
            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(password, salt)
            await user.save()

            //return jsonwebtoken
            const payload = {
                user: {
                    id:user.id
                }
            }

            jwt.sign(
                payload,
                config.get('jwtSecret'),
                {expiresIn: 360000},
                (err, token) => {
                    if (err) throw err
                    res.json({token})
                }
            )
            //res.send('user registered') // why server doesn't send token obj back since has this line
        } catch(err) {
            console.error(err.message)
            res.status(500).send('Server error')
        }
    }
)
module.exports = router
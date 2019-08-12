const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const {check, validationResult} = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../../models/User')
const config = require('config')

router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password')
        res.json(user)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Sever Error')
    }
})

router.post(
    '/',
    [
        check('email', 'include valid email').isEmail(),
        check('password', 'pass is require').not().isEmpty()
    ],
    async (req, res) => {

        // valadate request field
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }

        //compare user and password in database
        const {email, password} = req.body
        try {
            let user = await User.findOne({email: email})
            if (!user) {
                return res.status(400).json({errors: [{msg: 'Invalid Username'}]})
            }

            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) {
                return res.status(400).json({errors: [{msg: 'Invalid Pass'}]})
            }

            //return jsonwebtoken
            const payload = {
                user: {
                    id: user.id
                }
            }

            jwt.sign(
                payload,
                config.get('jwtSecret'),
                {expiresIn: 360000},
                (err, token) => {
                    if(err) throw err;
                    res.json({token})
                }
            )

        } catch (err) {
            console.error(err.message)
            res.status(500).send('Server error')
        }

    }
)

module.exports = router
const express = require('express')
const connectDB = require('./config/db')
const app = express()

//Connect Db
connectDB()

//Init middleware
app.use(express.json({extended: false }))

app.get('/', (req, res) => res.send("api drunning"))

app.use('/api/users', require('./routes/api/users'))
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log('server start on '+ PORT))
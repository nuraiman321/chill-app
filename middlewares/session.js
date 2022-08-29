const session = require('express-session')


// module.exports = session({ 
//     secret: process.env.SESSION_SECRET || 'keyboard cat',
//     cookie: { maxAge: 60000000 } })

    
 const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: true
})

module.exports = sessionMiddleware
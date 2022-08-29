const express = require('express')
const app = express()
const { Pool } = require('pg')
const expressLayouts = require('express-ejs-layouts')
const bcrypt = require('bcrypt')
const port = process.env.PORT || 5301
const checkIsLoggedIn = require('./middlewares/checkIsloggedin')
const moethodOverrideMiddleware = require('./middlewares/methodOverride')
const sessionMiddleware = require('./middlewares/session')

const db = require('./db/index')

// let db 
// if(process.env.NODE_ENV === 'production'){
//     db = new Pool ({
//         connectionString: process.env.DATABASE_URL,
//         ssl: {
//             rejectUnauthorized: false
//         }
//     })
// }else {

// }


app.use(expressLayouts)
app.use(express.static('public'))
app.use(sessionMiddleware)
app.use(express.urlencoded({ extended: true }))
app.use(moethodOverrideMiddleware)
app.use(checkIsLoggedIn)


app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    let sql = 'select * from places;'
    db.query(sql, (err, dbRes) => {
        if (err) {

            console.log(err)
        } else {

            let places = dbRes.rows
            res.render('home', { places: places })
        }

    })
})
// app.get('/', (req, res) => {
//     let sql = 'select * from places;'
//     db.query(sql, (err, dbRes) => {

//         console.log(err)
//         let places = dbRes.rows

//         res.render('home', { places: places })

//     })
// })



app.get('/places/:id', (req, res) => {

    // let placeName = req.query.name
    let id = req.params.id

    let sql = 'select * from places where id = $1'

    db.query(sql, [id], (err, dbRes) => {
        let place = dbRes.rows[0]
        userId = place.user_id

        let sqlUsername = `SELECT username FROM users where id = $1;`
        db.query(sqlUsername, [userId], (err, dbRes2) => {

            let username = dbRes2.rows[0].username
            res.render('placeDisc', { place: place, username: username })
        })


    })

})

app.get('/share_form', (req, res) => {
    // res.render('retrieve')
    if (res.locals.isLoggedIn === true) {
        res.render('retrieve')

    } else {
        res.render('loginForm')
    }
    // res.send('you are about to share something')
})

app.post('/upload', (req, res) => {
    let name = req.body.name
    let image = req.body.image_url
    let typeofplace = req.body.typeofplace
    let country = req.body.country
    let season = Number(req.body.season)
    let thingstodo = req.body.thingstodo
    let recomendation = Number(req.body.recomendation)
    let userId = Number(req.body.user_id)
    // console.log(userId)

    let details = [name, image, typeofplace, country, season,
        thingstodo, recomendation]



    sql = 'insert into places (name, image_url, typeofplace, country, season, thingstodo, recomendation, user_id) values ($1, $2, $3, $4, $5, $6, $7, $8)'
    db.query(sql, [name, image, typeofplace, country, season, thingstodo, recomendation, userId], (err, dbRes) => {
        if (err) {
            console.log(err);
        }

        res.redirect('/')
    })

}

)

app.get('/places/:id/emend', (req, res) => {
    let id = req.params.id
    sql = 'select * from places where id = $1'
    db.query(sql, [id], (err, dbRes) => {

        let place = dbRes.rows[0]

        res.render('emendForm', { place: place })
    })
})

app.put('/places/:id', (req, res) => {
    let sql = 'update places set name = $1, image_url = $2, typeofplace = $3, country = $4, season = $5, thingstodo = $6, recomendation = $7  where id = $8'
    db.query(sql, [req.body.name, req.body.image_url, req.body.typeofplace, req.body.country, req.body.season, req.body.thingstodo, req.body.recomendation, req.params.id], (err, dbRes) => {

        res.redirect(`/places/${req.params.id}`)
    })
})

app.get('/login', (req, res) => {
    res.render('loginForm')
})

app.post('/login', (req, res) => {

    const sql = 'select * from users where email = $1'

    db.query(sql, [req.body.email], (err, dbRes) => {
        if (err) {

            console.log(err)
        }

        let user = dbRes.rows[0]

        // console.log(user)
        if (user === undefined) {
            res.render('loginForm')
            return
        } else {


            bcrypt.compare(req.body.password, user.password_digest, (err, result) => {
                if (result) {
                    req.session.userId = user.id

                    res.redirect('/')
                } else {
                    res.render('loginForm')
                    //    alert('either email or password is wrong')




                }

            })
        }
    })
})

app.get('/signup', (req, res) => {
    res.render('signup_form')
})

app.post('/signup', (req, res) => {

    let email = req.body.email
    let username = req.body.username
    let plainPasword = req.body.password
    let reTypePlainPassword = req.body.reTypePassword

    let sql = 'SELECT * FROM users WHERE email = $1;'
    db.query(sql, [email], (err, dbRes) => {
        let user = dbRes.rows

        if (user.length !== 0) { //check existing email

            // res.render('signup_form')
            res.send('email already registered')
        } else {

            // res.send('continue..')
            let sqlUsername = 'SELECT * FROM users WHERE username = $1;'
            db.query(sqlUsername, [username], (err, dbRes1) => {
                let user1 = dbRes1.rows
                // console.log(user1); 
                if (user1.length !== 0) { //check existing username
                    res.send('username already been taken')
                } else {
                    if (plainPasword !== reTypePlainPassword) { // check pass & retype pass
                        res.send('Retype password note same as password')
                    } else {

                        bcrypt.hash(plainPasword, 10).then((hashPass) => {
                            // Store hash in your password DB.
                            sqlInsertUser = `INSERT INTO users (email, password_digest, username)
                            VALUES ($1, $2, $3);`

                            db.query(sqlInsertUser, [email, hashPass, username], (err, dbRes) => {
                                res.redirect('/login')
                            })
                        });
                    }



                }
            })
        }

    })


})

app.delete('/logout', (req, res) => {
    req.session.userId = undefined
    res.redirect('/login')
})


app.post('/delete/:id', (req, res) => {

    let sql = 'delete from places where id = $1;'

    db.query(sql, [req.params.id], (err, dbRes) => {

        res.redirect('/')
    })


})


app.listen(port, () => {
    console.log(`app listen to port ${port}`)
})
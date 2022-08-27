const express = require('express')
const app = express()
const { Pool } = require('pg')
const expressLayouts = require('express-ejs-layouts')
const methodOverride = require('method-override')
const bcrypt = require('bcrypt')
const session = require('express-session')
const port = process.env.PORT || 5301


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

const db = new Pool({
    user: 'postgres',
    database: 'chillplaces',
    password: 'easypassword'
})

app.use(expressLayouts)
app.use(express.static('public'))
app.use(session({ secret: 'keyboard cat', cookie: {maxAge: 60000}}))
app.use(express.urlencoded({ extended: true}))
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      var method = req.body._method
      delete req.body._method
      return method
    }
  }))

app.use((req, res, next) => {
     
    if(req.session.userId){
        res.locals.isLoggedIn = true
        
        const sql = 'select * from users where id = $1'
        
        db.query(sql, [req.session.userId], (err, dbRes) =>{
            console.log(err)
            res.locals.currentUser = dbRes.rows[0]
            next()
        } )
    }else {
        res.locals.isLoggedIn = false
        res.locals.currentUser = {}
        next()
    }
})

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    let sql = 'select * from places;'
    db.query(sql, (err, dbRes) => {
        console.log(err)
        let places = dbRes.rows
        
        res.render('home', { places: places})
    })
})
app.get('/', (req, res) => {
    let sql = 'select * from places;'
    db.query(sql, (err,dbRes) => {

        console.log(err)
        let places = dbRes.rows

        res.render('home', {places: places})

    })
})

app.get('/places/:id', (req, res) => {
    
    // let placeName = req.query.name
    let id = req.params.id

    let sql = 'select * from places where id = $1'

    db.query(sql, [id], (err, dbRes) => {
        let place = dbRes.rows[0]

        res.render('placeDisc', {place: place})
        
    })

})

app.get('/share_form', (req, res) => {
    // res.render('retrieve')
    if(res.locals.isLoggedIn === true){
        res.render('retrieve')

    }else {
        res.render('loginForm')
    }
    // res.send('you are about to share something')
})

app.post('/upload', (req, res) => {

    sql = 'insert into places (name, image_url, typeofplace, country, season, thingstodo, recomendation) values ($1, $2, $3, $4, $5, $6, $7);'

    db.query(sql, [req.body.name, req.body.image_url, req.body.typeofplace, req.body.country, req.body.season, req.body.thingstodo, req.body.recomendation], (err, dbRes) => {
        
        res.redirect('/')
    })
})

app.get('/places/:id/emend', (req, res) => {
    let id = req.params.id
    sql = 'select * from places where id = $1'
    db.query(sql, [id], (err, dbRes) => {
        
        let place = dbRes.rows[0]

        res.render('emendForm', {place: place})
    })
})

app.put('/places/:id', (req,res) => {
    let sql = 'update places set name = $1, image_url = $2, typeofplace = $3, country = $4, season = $5, thingstodo = $6, recomendation = $7  where id = $8'
    db.query(sql, [req.body.name, req.body.image_url, req.body.typeofplace, req.body.country, req.body.season, req.body.thingstodo, req.body.recomendation, req.params.id], (err, dbRes) => {
        
        res.redirect(`/places/${req.params.id}`)
    })
})

app.get('/login', (req, res) => {
    res.render('loginForm')
})

app.post('/login', (req, res) => {
    console.log('heyy')
    console.log(req.body.email)

    const sql = 'select * from users where email = $1'

    db.query(sql, [req.body.email], (err, dbRes) => {
        console.log(err)

        let user = dbRes.rows[0]

        console.log(user)

        bcrypt.compare(req.body.password, user.password_digest, (err, result) => {
            console.log(result)
            if(result){
                req.session.userId = user.id

                res.redirect('/')
            }else {
               res.render('/login') 
            //    alert('either email or password is wrong')
            
           
            
            
            }
        
        })
    })
})

app.delete('/logout', (req, res) => {
    req.session.userId = undefined
    res.redirect('/login')
})


app.post('/delete/:id', (req,res) => {

    let sql = 'delete from places where id = $1;'

    db.query(sql, [req.params.id], (err, dbRes) => {

        res.redirect('/')
    })


})


app.listen(port)
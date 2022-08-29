const db = require('../db')

const checkIsLoggedIn = (req, res, next) => {

    if (req.session.userId) {
        res.locals.isLoggedIn = true

        const sql = 'select * from users where id = $1'

        db.query(sql, [req.session.userId], (err, dbRes) => {
            if(err){

                console.log(err)
            }else{
                res.locals.currentUser = dbRes.rows[0]
                const sqlFinduser_id = `select * from places where user_id = $1;`
                db.query(sqlFinduser_id, [res.locals.currentUser.id], (err,dbRes2) => {
                    res.locals.postLength = dbRes2.rows.length
                    
                    next()
                })

            }
        })
    } else {
        res.locals.isLoggedIn = false
        res.locals.currentUser = {}
        next()
    }
}

module.exports = checkIsLoggedIn
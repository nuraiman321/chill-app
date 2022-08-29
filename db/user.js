const { Client } = require ('pg')
const bcrypt = require('bcrypt')

const db = new Client ({
    user: 'postgres',
    database: 'chillplaces',
    password:'easypassword'
})

// const email = 'him@gmail.com'
// const myPlaintextPassword = 'pudding'

const email = 'her@gmail.com'
const myPlaintextPassword = 'pudding'

bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(myPlaintextPassword, salt, (err, passwordDigest) => {
        
        db.connect()
        const sql = `
            INSERT INTO users (email, password_digest)
            VALUES ('${email}', '${passwordDigest}');
        `

        db.query(sql, (err, res) => {
            console.log(err)
            db.end()
        })
    });
});

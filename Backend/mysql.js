const mysql = require('mysql2')
const dotenv = require('dotenv')

dotenv.config()

const connection = mysql.createConnection({
    host : process.env.HOST,
    port : process.env.MYSQL,
    database : process.env.DATABASE,
    user : process.env.USER,
    password : process.env.PASSWORD
})

connection.connect((err)=>{
    if(err){
        console.log(err)
        return
    }

    console.log("Successfully Connected!")
})

module.exports = connection

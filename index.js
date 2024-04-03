import express from 'express'
import bodyParser from 'body-parser'
import pg from 'pg'

// server details
const app = express()
const port = 3000

////////////////////////////////
// database details ////////////
const db = new pg.Client({
    user: 'postgres',
    host: 'localhost',
    database: 'mattazada',
    password: '1234',
    port: 5432,
})
db.connect()
// database details end////////
///////////////////////////////


app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static("public"))


app.get('/', (req, res) =>{
    res.render('index.ejs', {database: db.database})
})

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`);
})
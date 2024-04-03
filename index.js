import express from 'express'
import bodyParser from 'body-parser'
import pg from 'pg'
import axios from 'axios'

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

/// book object to store in database

class Book{
    constructor(title, author, ratings_average, publish_year, isbn){
        this.title = title;
        this.author = author;
        this.ratings_average = ratings_average;
        this.publish_year = publish_year;
        this.isbn = isbn;

    }
}

app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static("public"))

app.get('/', async (req, res) =>{
    const result = await db.query('SELECT * from books')
    let books = []
    result.rows.forEach((book) =>{
        books.push(book)
        // console.log(book);
    })
    res.render('index.ejs', {books: books})
})

app.get('/search', async (req, res) => {
    const user_search = req.query.searchTitle
    
    let openLib_search = `https://openlibrary.org/search.json?title=${user_search}`

    try {
        const response = await axios.get(openLib_search);
        const data = response.data;
    
        if (data.docs && data.docs[0] && data.docs[0].isbn) {
            const firstBook = data.docs[0];

            console.log(firstBook.title_suggest, firstBook.author_name[0], firstBook.first_publish_year);
            // Create a new Book object with the data from the first book
            let user_book = new Book(firstBook.title_suggest, firstBook.author_name[0], parseFloat(firstBook.ratings_average),  parseInt(firstBook.first_publish_year), firstBook.isbn[0]);
            // add to DB
            let sql = 'INSERT INTO books (title, author, ratings_average, publish_year, isbn) VALUES ($1, $2, $3, $4, $5)';
            let values = [user_book.title, user_book.author, user_book.ratings_average, user_book.publish_year, user_book.isbn]
            db.query( sql, values, (err, result) =>{
                if (err) throw err;
                console.log("Book added to database");
            })

            res.redirect('/')
        }
    } catch(error){
        console.error(`Error: ${error}`);
    }

})

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`);
})
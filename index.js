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
    constructor(title, author, ratings_average, publish_year, isbn, first_sentence){
        this.title = title;
        this.author = author;
        this.ratings_average = ratings_average;
        this.publish_year = publish_year;
        this.isbn = isbn;
        this.first_sentence = first_sentence;
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
    const user_search = req.query.searchTitle;
    let openLib_search = `https://openlibrary.org/search.json?title=${user_search}`;

    try {
        const response = await axios.get(openLib_search);
        const data = response.data;

        if (data.docs && data.docs[0]) {
            const firstBook = data.docs[0];

            let author_name = firstBook.author_name && Array.isArray(firstBook.author_name) ? firstBook.author_name[0] : "";
            let isbn = firstBook.isbn && Array.isArray(firstBook.isbn) ? firstBook.isbn[0] : "";
            let first_sentence = firstBook.first_sentence && Array.isArray(firstBook.first_sentence) ? firstBook.first_sentence[0] : "";

            console.log(firstBook.title_suggest, author_name, firstBook.first_publish_year, first_sentence);

            let user_book = new Book(firstBook.title_suggest, author_name, parseFloat(firstBook.ratings_average), parseInt(firstBook.first_publish_year), isbn, first_sentence);

            console.log(user_book);

            let sql = 'INSERT INTO books (title, author, ratings_average, publish_year, isbn, first_sentence) VALUES ($1, $2, $3, $4, $5, $6)';
            let values = [user_book.title, user_book.author, user_book.ratings_average, user_book.publish_year, user_book.isbn, user_book.first_sentence];

            db.query(sql, values, (err, result) => {
                if (err) throw err;
                console.log("Book added to database");
            });

            res.redirect('/');
        }
    } catch (error) {
        console.error(`Error: ${error}`);
    }
});

app.listen(port, ()=>{
    console.log(`l81: Server running on port ${port}`);
})
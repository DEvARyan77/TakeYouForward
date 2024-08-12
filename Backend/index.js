const express = require('express');
const dotenv = require('dotenv');
const connection = require('./mysql');
const jsonwebtoken = require('jsonwebtoken');
const cookie = require('cookie-parser');
const cors = require('cors');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
    origin: ['https://frontend-one-sooty-63.vercel.app/','https://frontend-devaryan77s-projects.vercel.app/','https://frontend-git-master-devaryan77s-projects.vercel.app/','http://localhost:3001'], // Allows all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow these methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
    credentials: true, // Allow credentials if needed
};

app.use('*',cors(corsOptions));
app.use(cookie());
app.use(express.json());

const verifyToken = (req, res, next) => {
    try {
        const token = req.cookies.LoggedIn;
        req.username = jsonwebtoken.verify(token, process.env.JWT_SECRET || 'Token');
        next();
    } catch (error) {
        res.send('error');
    }
};

app.post('/', async (req, res) => {
    const { username, name, email, password } = req.body;

    const validation = `SELECT * FROM Users WHERE Username = ?`;
    connection.query(validation, [username], (err, result) => {
        if (err) return res.send('error');

        if (result.length === 0) {
            const register = `INSERT INTO Users (Username, Password, Name, Email) VALUES (?, ?, ?, ?)`;
            connection.query(register, [username, password, name, email], (err) => {
                if (err) return res.send('error');

                const createUserDatabase = `CREATE TABLE IF NOT EXISTS ?? (
                    Term VARCHAR(100) NOT NULL PRIMARY KEY UNIQUE,
                    Value VARCHAR(500) NOT NULL
                )`;

                connection.query(createUserDatabase, [username], (err) => {
                    if (err) {
                        const deleteUserQuery = `DELETE FROM Users WHERE Username = ?`;
                        connection.query(deleteUserQuery, [username]);
                        return res.send('error');
                    }
                    console.log("saved")
                    res.send('saved');
                });
            });
        } else {
            res.send('exist');
        }
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const getUser = `SELECT * FROM Users WHERE Username = ?`;
    connection.query(getUser, [username], (err, result) => {
        if (err) return res.send('error');

        if (result.length === 0) return res.send('User not found');

        const user = result[0];
        if (user.Password === password) {
            const token = jsonwebtoken.sign(username, process.env.JWT_SECRET || 'Token');
            res.cookie('LoggedIn', token, { httpOnly: true, secure: false, sameSite: 'Lax',maxAge: 3 * 24 * 60 * 60 * 1000 });
            res.send('Login successful');
        } else {
            res.send('Invalid password');
        }
    });
});

app.post('/getContent', verifyToken, (req, res) => {
    const getData = `SELECT * FROM ??`;
    connection.query(getData, [req.username], (err, result) => {
        if (err) return res.status(500).send('Error fetching data');
        res.send(result);
    });
});

app.post('/addCard', verifyToken, (req, res) => {
    const { term, value } = req.body;
    const insertData = `INSERT INTO ?? (Term, Value) VALUES (?, ?)`;
    connection.query(insertData, [req.username, term, value], (err, result) => {
        if (err){
            return res.status(500).send('error');
        }
        res.send('successfully');
    });
});

app.post('/deleteCard', verifyToken, (req, res) => {
    const { term } = req.body;
    const deleteQuery = `DELETE FROM ?? WHERE Term = ?`;
    connection.query(deleteQuery, [req.username, term], (err, result) => {
        if (err) return res.status(500).send('Error deleting card');
        if (result.affectedRows > 0) {
            res.send('Card deleted successfully');
        } else {
            res.status(404).send('Card not found');
        }
    });
});

app.post('/updateCardTerm', verifyToken, (req, res) => {
    const { term, value } = req.body;
    const updateQuery = `UPDATE ?? SET Term = ? WHERE Value = ?`;
    connection.query(updateQuery, [req.username, term, value], (err, result) => {
        if (err) return res.status(500).send('Error updating card');
        if (result.affectedRows > 0) {
            res.send('Card updated successfully');
        } else {
            res.status(404).send('Card not found');
        }
    });
});

app.post('/updateCardValue', verifyToken, (req, res) => {
    const { term, value } = req.body;
    const updateQuery = `UPDATE ?? SET Value = ? WHERE Term = ?`;
    connection.query(updateQuery, [req.username, value, term], (err, result) => {
        if (err) return res.status(500).send('Error updating card');
        if (result.affectedRows > 0) {
            res.send('Card updated successfully');
        } else {
            res.status(404).send('Card not found');
        }
    });
});

app.listen(port, () => {
    console.log(`Listening at port ${port}`);
});


app.post('/logOut', (req, res) => {
    const { newValue } = "req.body";

    res.cookie('LoggedIn', newValue, {
        httpOnly: false, // or true if needed
        secure: false, // change to true if using HTTPS
        sameSite: 'Lax',
        maxAge: 3 * 24 * 60 * 60 * 1000 // 3 days in milliseconds
    });
    
    res.send('Cookie updated');
});

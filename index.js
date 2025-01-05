const express = require('express');
const mongoose = require('mongoose');
const fileupload = require('express-fileupload');
const pug = require('pug');
const bcrypt = require('bcrypt');
const fs = require('fs');
const app = express();
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded());
app.use(fileupload());
app.set('view engine', 'pug');
app.listen(3008, () => {
    console.log("Server is running at 3008...!");
});
mongoose.connect('mongodb://localhost:27017/ticketbooking')
    .then(() => console.log("Connection Successful"))
    .catch(() => console.log("Connection failed!"));
const theatreschema = new mongoose.Schema({
    Cityname: String,
    Theatre: String
});
const theatremodel = new mongoose.model('csedata', theatreschema, 'theatres');
const movieschema = new mongoose.Schema({
    Theatre: String,
    Movie1: String,
    Movie2: String,
    Movie3: String
});
const moviemodel = new mongoose.model('csedata1', movieschema, 'movies');

const loginschema = new mongoose.Schema({
    Username: String,
    Password: String
});
const loginmodel = new mongoose.model('csedata3', loginschema, 'LoginDetails');

const personSchema = new mongoose.Schema({
    Name: String,
    Movie: String,
    Class: String,
    Options: [String],
    Seats: Number
});

// Define the person model
const personModel = mongoose.model('csedata2', personSchema, 'PersonDetails');

app.get('/home', (req, res) => {
    res.sendFile(__dirname + '/public/main.html');
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

app.get('/index', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/forgotpassword', (req, res) => {
    res.sendFile(__dirname + '/public/forgotpassword.html');
});
app.post('/search', async (req, res) => {
    const movie = await moviemodel.findOne({ Movie1: req.body.lsearch });
    if (movie) {
        file = '/moviepics/' + req.body.lsearch + '.jpg';
        res.render('middle.pug', { file });
    } else {
        res.status(404).json({ message: "Movie not found" });
    }

});

app.post('/login', async (req, res) => {
    Username = req.body.user;
    Password = req.body.pass;
    const hashedpassword = await bcrypt.hash(Password, 10);
    const newuser = new loginmodel({ Username, Password: hashedpassword })
    await newuser.save().then((info) => {
        res.sendFile(__dirname + '/public/index.html');
    })
});

app.post('/index', async (req, res) => {
    const user = await loginmodel.findOne({ Username: req.body.luser });
    if (user) {
        const passwordmatch = await bcrypt.compare(req.body.lpass, user.Password);
        if (passwordmatch) {
            res.sendFile(__dirname + '/public/something.html');
        } else {
            res.sendFile(__dirname + '/public/index.html');
        }
    } else {
        res.sendFile(__dirname + '/public/index.html');
    }
});

app.post('/booking', async (req, res) => {
    const name = req.body.Name;
    const movie = req.body.Movie;
    const ticketClass = req.body.ticketClass;
    let options;

    switch (ticketClass) {
        case 'VIP':
            options = req.body.vipOption || [];
            break;
        case 'FirstClass':
            options = req.body.firstClassOption || [];
            break;
        case 'SecondClass':
            options = req.body.secondClassOption || [];
            break;
        default:
            options = [];
    }

    const data = {
        Name: name,
        Movie: movie,
        Class: ticketClass,
        Options: options,
        Seats: req.body.Seats
    };

    try {
        const newPerson = new personModel(data);
        await newPerson.save();
        res.sendFile(__dirname + '/public/theatre.html');
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).send('Error saving data');
    }
});

function showVIPOptions() {
    document.getElementById('vipOptions').style.display = 'block';
    document.getElementById('firstClassOptions').style.display = 'none';
    document.getElementById('secondClassOptions').style.display = 'none';
}
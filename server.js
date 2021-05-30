const express = require('express');
const app = express();
const port = 3000;
var mysql = require('mysql');
var con;
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());


app.get('/', (req, res) => {
    res.render("home", { result: "test" });
});


app.post('/database', (req, res) => {
    con = mysql.createConnection({
        host: req.body.host,
        user: req.body.username,
        password: req.body.password,
        database: req.body.database
    });

    con.connect(function (err) {
        if (err) { res.render("home", { result: err }) }
        else {
            console.log("Connected!");
            res.render("database", { result: [] });
        }
    });
});

app.post('/query', (req, res) => {

    con.query(req.body.query, function (err, result) {
        if (err) {
            console.log(err)
            res.render("database", { "result": JSON.stringify(err) });
        }
        else {
            console.log("Query Done");

            res.render("database", { "result": JSON.stringify(result) });
        }
    });
});

app.listen(port, "0.0.0.0", () => {
    console.log(`App is running on port ${port}`);
});
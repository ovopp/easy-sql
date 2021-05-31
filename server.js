const express = require('express');
const app = express();
const port = 3000;
var LocalStorage = require('node-localstorage').LocalStorage;
if (typeof localStorage === "undefined" || localStorage === null) {
    var localStorage = new LocalStorage('./scratch');
}

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
    var history_queries = localStorage.getItem("history") == null ? [] : JSON.parse(localStorage.getItem("history"));

    con.connect(function (err) {
        if (err) { res.render("home", { result: err }) }
        else {
            console.log("Connected!");
            res.render("database", { "result": "", "history": history_queries });
        }
    });
});

app.post('/query', (req, res) => {
    var history_queries = localStorage.getItem("history") == null ? [] : JSON.parse(localStorage.getItem("history"));
    con.query(req.body.query, function (err, result) {
        if (err) {
            console.log(err)
            res.render("database", { "result": JSON.stringify(err), "history": history_queries });
        }
        else {
            console.log("Query Done");
            if(history_queries.length === 10){
                history_queries = history_queries.slice(1,10);
            }
            history_queries.push(req.body.query);
            localStorage.setItem("history", JSON.stringify(history_queries));
            res.render("database", { "result": JSON.stringify(result), "history": history_queries });
        }
    });
});

app.listen(port, "0.0.0.0", () => {
    console.log(`App is running on port ${port}`);
});
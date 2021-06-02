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
    res.render("home");
});


app.post('/selectdb', (req, res) => {
    con = mysql.createConnection({
        host: req.body.host,
        user: req.body.username,
        password: req.body.password
    });
    con.connect(function (err) {
        if (err) { res.redirect("/") }
        else {
            console.log("Connected!");
            var databases = [];
            con.query('show databases;', function (err, result) {
                if (err) {
                    console.log(err);
                }
                else {
                    for (var i = 0; i < result.length; i++) {
                        databases.push(result[i].Database);
                    }
                    res.render("selectdb", { "databases": databases });
                }
            });
        }
    });
});

app.post('/database', (req, res) => {
    if (con === "undefined") {
        res.redirect("/");
    } else {
        con.query("use " + req.body['selected-db'] + ";", function (err, result) {
            if (err) {
                res.render("home", { result: err });
            }
            else {
                con.query("show tables;", function (err, tables_results) {
                    var return_table = []
                    for (var i = 0; i < tables_results.length; i++) {
                        return_table.push(Object.values(tables_results[i])[0]);
                    }
                    res.render("database", { "result": " ", "history": localStorage.getItem("history") == null ? [] : JSON.parse(localStorage.getItem("history")), "tables": return_table })
                })
            }
        });
    }
});

app.post('/query', (req, res) => {
    var history_queries = localStorage.getItem("history") == null ? [] : JSON.parse(localStorage.getItem("history"));
    if (con === "undefined") {
        res.redirect("/");
    } else {
        con.query(req.body.query, function (err, result) {
            if (err) {
                console.log(err)
                res.render("database", { "result": JSON.stringify(err), "history": history_queries, "tables": [] });
            }
            else {
                console.log("Query Done");
                if (history_queries.length === 10) {
                    history_queries = history_queries.slice(1, 10);
                }
                history_queries.push(req.body.query);
                localStorage.setItem("history", JSON.stringify(history_queries));
                con.query("show tables;", function (err, tables_results) {
                    var return_table = []
                    for (var i = 0; i < tables_results.length; i++) {
                        return_table.push(Object.values(tables_results[i])[0]);
                    }
                    res.render("database", { "result": JSON.stringify(result), "history": history_queries, "tables": return_table });
                });
            }
        });
    }
});


app.listen(port, "0.0.0.0", () => {
    console.log(`App is running on port ${port}`);
});
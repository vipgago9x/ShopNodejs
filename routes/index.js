var express = require('express');
var app = express();
let mongodb = require('mongodb');
let formidable = require('formidable');
let fs = require('fs');
let bodyParser = require('body-parser');
let util = require('util');
let cookieParser = require('cookie-parser');
/* GET home page. */
app.use(cookieParser());

app.get('/', function(req, res, next) {
    let a = Math.random() * (99999 - 10000) + 10000;
    if (req.cookies.id) {
        console.log(req.cookies.id);
    } else {
        res.cookie('id', a.toString(), { maxAge: 1000 * 60 * 60 * 24 });
        console.log('Add id into cookie');
    }
    res.render('index', { req: req });
});


app.route('/add')
    .get((req, res) => {
        if (req.isAuthenticated()) {
            res.render('add', { req: req });
        } else {
            res.redirect('/login');
        }
    })
    .post((req, res) => {
        let form = new formidable.IncomingForm();
        form.uploadDir = './public/uploads/';
        form.parse(req, (err, fields, files) => {
            let path = files.files.path;
            let newpath = form.uploadDir + files.files.name;
            fs.rename(path, newpath, (err) => {
                if (err) throw err;
                console.log('doi ten thanh cong');
            });
            let image = 'uploads/' + files.files.name;
            mongodb.connect('mongodb://localhost:27017', (err, client) => {
                if (err) throw err;
                let db = client.db('Shop');
                let collection = db.collection('products');
                let name = util.inspect(fields.name1),
                    description = util.inspect(fields.description),
                    category = util.inspect(fields.category),
                    price = util.inspect(fields.price);
                name = name.slice(1, name.length - 1);
                description = description.slice(1, description.length - 1);
                category = category.slice(1, category.length - 1);
                price = price.slice(1, price.length - 1);
                let data = {
                    name: name,
                    description: description,
                    category: category,
                    price: price,
                    image: image,
                }
                collection.insertOne(data);
                console.log('da luu product');
            });
        });
        return res.redirect('/');
    });

module.exports = app;
let express = require('express');
let app = express();
let model = require('../models/model');
let Cart = model.cart;
let cookieParser = require('cookie-parser');
let Product = model.products;
// let io = require('socket.io')(app);

app.use(cookieParser());

app.route('/addcart/:id')
    .get((req, res) => {
        let id = req.params.id;
        let clientID = req.cookies.id;
        console.log(clientID);
        Cart.create({ product_id: id, clientID: clientID });
        console.log('da them vao cart');
        return res.redirect('/single/' + id);
    });

app.get('/cart', (req, res) => {
    let clientID = req.cookies.id;
    Cart.find((err, data) => {
        if (err) throw err;
        var data1 = data.filter((value, index, data) => {
            if (value.clientID == clientID) return value;
        });
        Product.find((err, Products) => {
            let items = new Array();
            for (let i = 0; i < data1.length; i++) {
                let item = Products.find(Products => Products._id == data1[i].product_id);
                items.push(item);
            }
            var total_price = 0;
            if (items.length > 0) {
                total_price = items.reduce((price, item, index, items) => {
                    return price += item.price;
                }, 0);
            }
            return res.render('checkout', { req: req, items: items, total_price: total_price });
        });
    });
});



module.exports = app;
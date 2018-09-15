var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var graphqlHTTP = require('express-graphql');
var mongoose = require('mongoose');
let db_name = (process.env.DB_NAME) ? process.env.DB_NAME : 'shopify';
let db_path =  (process.env.MONGO_SERVICE_HOST && process.env.MONGO_SERVICE_PORT)
		? 'mongodb://' + process.env.MONGO_SERVICE_HOST + ':' + process.env.MONGO_SERVICE_PORT + '/' + db_name
		: 'mongodb://localhost:27017/' + db_name;
console.log("Connecting to " + db_path);
mongoose.connect(db_path);

var index = require('./routes/index');

var { shopSchema, shopRoot } = require('./graphql/shop.js');
var { productSchema, productRoot } = require('./graphql/product.js');
var { lineItemSchema, lineItemRoot } = require('./graphql/line_item.js');
var { orderSchema, orderRoot } = require('./graphql/order.js');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

app.use('/graphql/order', graphqlHTTP({
  schema: orderSchema,
  rootValue: orderRoot,
  graphiql: true
}));

app.use('/graphql/line_item', graphqlHTTP({
  schema: lineItemSchema,
  rootValue: lineItemRoot,
  graphiql: true
}))

app.use('/graphql/product', graphqlHTTP({
  schema: productSchema,
  rootValue: productRoot,
  graphiql: true
}));

app.use('/graphql/shop', graphqlHTTP({
  schema: shopSchema,
  rootValue: shopRoot,
  graphiql: true
}));

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

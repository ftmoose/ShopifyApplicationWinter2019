# 2018 Shopify Intern Application Challenge

### Contents
* [Installing](#installing)
* Interfacing with the API
* Tests

## Getting Started

Follow these instructions to get a copy of my project running on your local machine.

Or click [here](http://35.237.111.74/) to checkout a live version deployed with [Docker](https://www.docker.com/) and [Kubernetes](https://github.com/kubernetes/kubernetes) on [Google Kubernetes Engine](https://cloud.google.com/kubernetes-engine/) 

### Prerequisites

For this to work you'll need to have the following installed:
* [NodeJS (npm)](https://nodejs.org/en/download/) - NPM is a package manager for NodeJS, it comes preinstalled with NodeJS
* [MongoDB](https://docs.mongodb.com/manual/installation/) - No-SQL, document-oriented database program

### Installing
*Before starting make sure you have mongodb running on localhost.*

#### Cloning

Start by cloning the repo into a directory of your choice

```
git clone https://github.com/rammom/ShopifyApplicationWinter2019.git
```

#### Populating database

I've made a seed data folder for you to easily populate your local mongodb database. If you don't want to upload this data you can skip this step.

```
cd ./datadump
mongorestore -d shopify shopify
```

Or if you want to use a custom database name:

```
cd ./datadump
mongorestore -d <custom name> shopify
```

#### Installing dependencies

Move into the repository and install all dependencies

```
cd ../app/
npm install
npm audit fix
```

#### Last step

Run the app

```
npm run dev
```

Or if you want to run the app with a custom database name (default database is *shopify*), do this
*Note: If you chose to use a custom database name while restoring the data, you must do this step*

```
DB_NAME=<custom name> npm run dev
```

That's it! Checkout the app on http://localhost:8080

## API

The app's api is build with graphql.  [Graphiql](https://github.com/graphql/graphiql) is enabled by default, you can make all api calls and queries from here.

I've split the api into four sections:
* Shop - http://localhost:8080/graphql/shop
* Order - http://localhost:8080/graphql/order
* Product - http://localhost:8080/graphql/product
* LineItem - http://localhost:8080/graphql/line_item

You must be on and object's corresponding link to query it.

*Disclaimer: All example data is from the data seed files I have included in this repo, they will not work on the live version deployed through GKE*

### Shops

http://localhost:8080/graphql/shop

Here is what the shop schema looks like: 

```
type ShopObject {
    _id: String!
    name: String!
    info: String!
    products: [String]!
    orders: [String]!
}

type Query {
    getShop(_id: String!): ShopObject
    getShopsByName(name: String): [ShopObject]
}

type Mutation {
    createShop(name: String!, info: String!): ShopObject
    updateShop(_id: String!, name: String, info: String): ShopObject
    deleteShop(_id: String!): Boolean
}
```

An example of a query would be:

```
query ShopObject($name: String){
    getShopsByName(name: $name){
        _id
        name
        info
        products
        orders
    }
}

Variables:
{
    "name": "Music Store"
}
```

*Note: To get all the shops you can run the query above with no name*

Here is a list of Shops included in the MongoDB seed file:

```
* Music Store
* Grocery Store
```


### Orders

http://localhost:8080/graphql/order

Here is what the order schema looks like:

```
type OrderObject {
    _id: String!
    date: String!
    shop: String!
    line_items: [String]!
    total: Float!
    refunded: Boolean!
}

type Query {
    getOrderById(_id: String!): OrderObject
    getOrdersByShopId(shopId: String): [OrderObject]
}

type Mutation {
    createOrder(shopId: String!, line_items: [String]!): OrderObject
    refundOrder(_id: String!): OrderObject
}
```

An example of a query would be:

```
query OrderObject($_id: String!){
    getOrderById(_id: $_id){
      _id
      date
      shop
      line_items
      total
      refunded
    }
}

Varables:
{
    "_id": "5b9d78592f14806525f00c21"
}
```

Here is a list of order ids included in the MongoDB seed file:

```
* 5b9d78592f14806525f00c21
* 5b9d7a4d3f03e3659f2f892c
```

### Products

http://localhost:8080/graphql/product

Here is what the order schema looks like:

```
type ProductObject {
    _id: String!
    name: String!
    price: Float!
    line_items: [String]!
    archived: Boolean
}

type Query {
    getProductById(_id: String!): ProductObject
    getProductsByName(name: String): [ProductObject]
}

type Mutation {
    createProduct(name: String!, price: Float!, shopId: String): ProductObject
    updateProduct(_id: String!, name: String, price: Float): ProductObject
    archiveProduct(_id: String!): ProductObject
    unarchiveProduct(_id: String!): ProductObject
    deleteProduct(_id: String!, verification: Boolean!): Boolean
}
```

An example of a query would be:

```
query ProductObject($name: String!){
    getProductsByName(name: $name){
        _id
        name
        price
        line_items
        archived
    }
}

Variables:
{
    "name": "Chocolate Bar"
}
```

*Note: To get all the products you can run the query above with no name*

Here is a list of products included in the MongoDB seed file:

```
* Hip Hop Mixtape
* Mozart: Complete Works
* K-pop
* Apples
* Oranges
* Kiwi
* Watermelon
```

### Line Items

http://localhost:8080/graphql/line_item

Here is what the line item schema looks like:

```
type LineItemObject {
    _id: String!
    product: String!
    qty: Int!
    total: Float!
}

type Query {
    getLineItemById(_id: String!): LineItemObject
    getLineItemsByProductId(productId: String): [LineItemObject]
}

type Mutation {
    createLineItem(productId: String!, qty: Int!): LineItemObject
    createLineItems(productIds: [String]!, qtys: [Int]!): [LineItemObject]
    updateLineItem(_id: String!, qty: Int): LineItemObject
    deleteLineItem(_id: String!): Boolean
}
```

An example of a query would be:

```
query LineItemObject($_id: String!){
    getLineItemById(_id: $_id){
        _id
        product
        qty
        total
    }
}


Variables:
{
  "_id": "<ID>"
}
```

Here is a list of line item ids included in the MongoDB seed file:

```
* 5b9d78592f14806525f00c1f
* 5b9d78592f14806525f00c20
* 5b9d7a4d3f03e3659f2f892a
* 5b9d7a4d3f03e3659f2f892b
```



























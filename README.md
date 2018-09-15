# 2018 Shopify Intern Application Challenge

!!! Intro paragraph goes here !!!

## Getting Started

Follow these instructions to get a copy of my project running on your local machine

### Prerequisites

For this to work you'll need to have the following installed:
* [NodeJS (npm)](https://nodejs.org/en/download/) - NPM is a package manager for NodeJS, it comes preinstalled with NodeJS
* [MongoDB](https://docs.mongodb.com/manual/installation/) - No-SQL, document-oriented database program

### Installing
*Before starting make sure you have mongodb running on localhost.*

Start by cloning the repo into a directory of your choice

```
git clone https://github.com/rammom/ShopifyApplicationWinter2019.git
```

Move into the repository and install all dependencies

```
cd ShopifyApplicationWinter2019/app/
npm install
npm audit fix
```

Run the app

```
npm run dev
```

That's it! Checkout the app on http://localhost:8080

## API

The app's api is build with graphql.  [Graphiql](https://github.com/graphql/graphiql) is enabled by default, you can make all api calls and queries from here.

I've split the api into four sections:
* Shop - http://localhost:8080/graphql/shop
* Order - http://localhost:8080/graphql/order
* Product - http://localhost:8080/graphql/product
* LineItem - http://localhost:8080/graphql/line_item

You mush be on and object's corresponding link to query it.

### Orders

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

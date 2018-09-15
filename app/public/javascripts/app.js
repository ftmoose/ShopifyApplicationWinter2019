var app = angular.module('myApp', []);

app.controller('MainController', ["$scope", "$http", "$window", function ($scope, $http, $window) {
    
    // get all shops
    $scope.getAllShops = function(){
        var query = `
            query ShopObject($name: String){
                getShopsByName(name: $name){
                    _id
                    name
                    info
                    products
                    orders
                }
            }
        `;
        $http({
            method: 'POST',
            url: '/graphql/shop',
            data: {query}
        })
        .then(function(res){
            $scope.shops = res.data.data.getShopsByName.reverse();
        });
    }
    $scope.getAllShops();

    // get all products
    $scope.getAllProducts = function(){
        var query = `
            query ProductObject($name: String){
                getProductsByName(name: $name){
                    _id
                    name
                    price
                    line_items
                    archived
                }
            }
        `;
        $http({
            method: 'POST',
            url: '/graphql/product',
            data: { query }
        })
        .then(function (res) {
            $scope.products = res.data.data.getProductsByName.reverse();
        });
    }
    $scope.getAllProducts();

    // get all orders
    $scope.getAllOrders = function(){
        var query = `
            query OrderObject($shopId: String){
                getOrdersByShopId(shopId: $shopId){
                    _id
                    date
                    shop
                    line_items
                    total
                    refunded
                }
            }
        `;
        $http({
            method: 'POST',
            url: '/graphql/order',
            data: { query }
        })
        .then(function (res) {
            $scope.orders = res.data.data.getOrdersByShopId;
        });
    }
    $scope.getAllOrders();

    // get all line items
    $scope.getAllLineItems = function(cb){
        let query = `
            query LineItemObject($productId: String){
                getLineItemsByProductId(productId: $productId){
                    _id
                    product
                    qty
                    total
                }
            }
        `;
        $http({
            method: 'POST',
            url: '/graphql/line_item',
            data: { query }
        })
        .then(function (res) {
            $scope.line_items = res.data.data.getLineItemsByProductId;
        });
        if (cb) cb();
    }

    $scope.newProduct = {
        name: "",
        price: ""
    }

    $scope.newShop = {
        name: "",
        info: ""
    }

    $scope.cart = {
        line_items: [],
        total: 0
    }
    $scope.getAllLineItems();

    $scope.currentOrder = null;
    $scope.currentProduct = null;

    $scope.setCurrentOrder = function(o){
        $scope.currentOrder = o;
        // resolve line items
        for (var i = 0; i < $scope.currentOrder.line_items.length; i++) {
            $scope.line_items.forEach(function (line_item) {
                if ($scope.currentOrder.line_items[i] == line_item._id){
                    $scope.currentOrder.line_items[i] = line_item;
                    // resolve product
                    $scope.products.forEach(function(product){
                        if (product._id == $scope.currentOrder.line_items[i].product)
                            $scope.currentOrder.line_items[i].product = product;
                    });
                }
            });
        }
    }

    $scope.setCurrentProduct = function(p){
        $scope.currentProduct = p;
        // resolve line items
        for (var i = 0; i < $scope.currentProduct.line_items.length; i++) {
            $scope.line_items.forEach(function (line_item) {
                if ($scope.currentProduct.line_items[i] == line_item._id) {
                    $scope.currentProduct.line_items[i] = line_item;
                    $scope.orders.forEach(function(order){
                        order.line_items.forEach(function(li){
                            if (li._id) li = li._id;
                            if (li == $scope.currentProduct.line_items[i]._id){
                                $scope.currentProduct.line_items[i].order = order;
                            }
                        });
                    });
                }
            });
        }
        $scope.currentProduct.line_items = $scope.currentProduct.line_items.reverse();
    }

    $scope.setCurrentShopById = function(id){
        $scope.currentShop = null;
        $scope.$apply();
        $scope.shops.forEach(function(shop){
            if (shop._id == id){
                $scope.currentShop = shop;
                // resolve products
                for (var i = 0; i < $scope.currentShop.products.length; i++) {
                    $scope.products.forEach(function (product) {
                        if ($scope.currentShop.products[i] == product._id)
                            $scope.currentShop.products[i] = product;
                    });
                }
                // resolve orders
                for (var i = 0; i < $scope.currentShop.orders.length; i++) {
                    $scope.orders.forEach(function (order) {
                        if ($scope.currentShop.orders[i] == order._id)
                            $scope.currentShop.orders[i] = order;
                    });
                }
            }
        });
        $scope.currentShop.products.reverse();
        $scope.currentShop.orders.reverse();
        $scope.clearCart();
    }

    $scope.clearCart = function(){
        $scope.cart = {
            line_items: [],
            total: 0
        }
    }

    $scope.switchShop = function(s){
        if ($scope.currentShop && ($scope.currentShop._id == s._id)) return;
        $scope.currentShop = s;
        // resolve products
        for (var i = 0; i < $scope.currentShop.products.length; i++){
            $scope.products.forEach(function(product){
                if ($scope.currentShop.products[i] == product._id)
                    $scope.currentShop.products[i] = product;
            });
        }
        // resolve orders
        for (var i = 0; i < $scope.currentShop.orders.length; i++) {
            $scope.orders.forEach(function (order) {
                if ($scope.currentShop.orders[i] == order._id)
                    $scope.currentShop.orders[i] = order;
            });
        }
        $scope.currentShop.products.reverse();
        $scope.currentShop.orders.reverse();
        $scope.clearCart();
    }

    $scope.createNewProduct = function (shopId) {
        if (!$scope.newProduct.name || !$scope.newProduct.price) return;
        $scope.newProduct.price = parseFloat(parseFloat($scope.newProduct.price).toFixed(2));
        let name = $scope.newProduct.name;
        let price = $scope.newProduct.price;
        let query = `
            mutation ProductObject($name: String!, $price: Float!, $shopId: String){
                createProduct(name: $name, price: $price, shopId: $shopId){
                    _id
                    name
                    price
                    line_items
                    archived
                }
            }
        `;
        $http({
            method: 'POST',
            url: '/graphql/product',
            data: { query, variables: { name, price, shopId } }
        })
        .then(function (res) {
            $scope.products.unshift(res.data.data.createProduct._id);
            $scope.currentShop.products.unshift(res.data.data.createProduct);
            $scope.newProduct = null;
        });
    }

    $scope.editProduct = function(product){
        let _id = product._id;
        let name = product.name;
        let price = product.price;
        let query = `
            mutation ProductObject($_id: String!, $name: String, $price: Float!){
                updateProduct(_id: $_id, name: $name, price: $price){
                    _id
                    name
                    price
                }
            }
        `;
        $http({
            method: 'POST',
            url: '/graphql/product',
            data: { query, variables: { _id, name, price } }
        })
        .then(function (res) {
            $scope.products.forEach(function(p){
                if (p._id == product._id){
                    p.name = product.name;
                    p.price = product.price;
                }
            });
        });
    }

    $scope.archiveProduct = function(_id){
        let query = `
            mutation ProductObject($_id: String!){
                archiveProduct(_id: $_id){
                    _id
                    archived
                }
            }
        `;
        $http({
            method: 'POST',
            url: '/graphql/product',
            data: { query, variables: { _id } }
        })
        .then(function (res) {
            $scope.products.forEach(function (p) {
                if (p._id == res.data.data.archiveProduct._id) {
                    p.archived = res.data.data.archiveProduct.archived;
                }
            });
        });
    }

    $scope.unarchiveProduct = function(_id){
        let query = `
            mutation ProductObject($_id: String!){
                unarchiveProduct(_id: $_id){
                    _id
                    archived
                }
            }
        `;
        $http({
            method: 'POST',
            url: '/graphql/product',
            data: { query, variables: { _id } }
        })
        .then(function (res) {
            $scope.products.forEach(function (p) {
                if (p._id == res.data.data.unarchiveProduct._id) {
                    p.archived = res.data.data.unarchiveProduct.archived;
                }
            });
        });
    }

    $scope.createNewShop = function(){
        if (!$scope.newShop.name || !$scope.newShop.info) return;
        let name = $scope.newShop.name;
        let info = $scope.newShop.info;
        let query = `
            mutation ShopObject($name: String!, $info: String!){
                createShop(name: $name, info: $info){
                    _id
                    name
                    info
                    products
                    orders
                }
            }
        `;
        $http({
            method: 'POST',
            url: '/graphql/shop',
            data: { query, variables: {name, info} }
        })
        .then(function (res) {
            $scope.shops.unshift(res.data.data.createShop);
            $scope.currentShop = $scope.shops[0];
            $scope.clearCart();
        });
    }

    $scope.editShop = function(){
        let _id = $scope.currentShop._id;
        let name = $scope.currentShop.name;
        let info = $scope.currentShop.info;
        let query = `
            mutation ShopObject($_id: String!, $name: String, $info: String){
                updateShop(_id: $_id, name: $name, info: $info){
                    _id
                    name
                    info
                }
            }
        `;
        $http({
            method: 'POST',
            url: '/graphql/shop',
            data: { query, variables: { _id, name, info } }
        })
        .then(function (res) {
            $scope.shops.forEach(function(shop){
                if (shop._id == $scope.currentShop._id){
                    shop.name = $scope.currentShop.name;
                    shop.info = $scope.currentShop.info;
                }
            });
        });
    }

    $scope.deleteShop = function(shopId){
        let _id = shopId;
        let query = `
            mutation ShopObject($_id: String!){
                deleteShop(_id: $_id)
            }
        `;
        $http({
            method: 'POST',
            url: '/graphql/shop',
            data: { query, variables: { _id } }
        })
        .then(function (res) {
            $scope.currentShop = null;
            $scope.clearCart();
            for(var i = 0; i < $scope.shops.length; i++){
                if ($scope.shops[i]._id == _id){
                    $scope.shops.splice(i, 1);
                    break;
                }
            }
        });
    }

    $scope.addProductToCart = function(product){
        // check if product already in cart
        var updated = false;
        $scope.cart.line_items.forEach(function(line_item){
            if (line_item.product._id == product._id){
                line_item.qty++;
                line_item.total = line_item.qty * product.price;
                updated = true;
            }
        });
        if (!updated){
            // bootstrap new line_item
            $scope.cart.line_items.unshift({
                product: product,
                qty: 1,
                total: product.price
            });
        }
        $scope.adjustCartTotal();
    }

    $scope.removeUnitFromCart = function(productId){
        for (let i = 0; i < $scope.cart.line_items.length; i++){
            if ($scope.cart.line_items[i].product._id == productId){
                $scope.cart.line_items[i].qty--;
                if ($scope.cart.line_items[i].qty == 0) {
                    $scope.cart.line_items.splice(i,1);
                }
                break;
            }
        }
        $scope.adjustCartTotal();
    }

    $scope.adjustCartTotal = function(){
        var total = 0;
        $scope.cart.line_items.forEach(function(line_item){
            total += line_item.total;
        });
        $scope.cart.total = total;
    }

    $scope.completeOrder = async function(){
        var line_items;
        
        // create line items and get ids
        let productIds = [];
        let qtys = []
        $scope.cart.line_items.forEach(function(line_item){
            productIds.push(line_item.product._id);
            qtys.push(line_item.qty);
        });
        let query = `
            mutation LineItemObject($productIds: [String]!, $qtys: [Int]!){
                createLineItems(productIds: $productIds, qtys: $qtys){
                    _id
                    product
                    qty
                    total
                }
            }
        `;
        await $http({
            method: 'POST',
            url: '/graphql/line_item',
            data: { query, variables: { productIds, qtys } }
        })
        .then(function (res) {
            $scope.line_items = $scope.line_items.concat(res.data.data.createLineItems);
            line_items = res.data.data.createLineItems.map( li => li._id );
        });

        if (!line_items)
            return $window.alert("Error processing order.. please try again");

        // create new order
        let shopId = $scope.currentShop._id;
        query = `
            mutation OrderObject($shopId: String!, $line_items: [String]!){
                createOrder(shopId: $shopId, line_items: $line_items){
                    _id
                    date
                    shop
                    line_items
                    total
                    refunded
                }
            }
        `;
        await $http({
            method: 'POST',
            url: '/graphql/order',
            data: { query, variables: { shopId, line_items } }
        })
        .then(async function (res) {
            let newOrder = Object.assign({}, res.data.data.createOrder);

            $scope.currentShop.orders.unshift(newOrder);
            $scope.orders.push(newOrder);
        
            $scope.clearCart();


            for (let i = 0; i < newOrder.line_items.length; i++){
                // resolve line item
                $scope.line_items.forEach(function(li){
                    if (newOrder.line_items[i] == li._id){
                        newOrder.line_items[i] = li;
                    }
                });

                for (let j = 0; j < $scope.currentShop.products.length; j++) {
                    if ($scope.currentShop.products[j]._id == newOrder.line_items[i].product){
                        $scope.currentShop.products[j].line_items.push(newOrder.line_items[i]._id);
                    }
                }
            }

        });
    }

    $scope.refundOrder = function(orderId) {
        // make frontend change
        $scope.orders.forEach(function(order){
            if (orderId == order._id)
                order.refunded = true;
        });
        $scope.currentShop.orders.forEach(function(order){
            if (orderId == order._id)
                order.refunded = true;
        });
        // edit db
        let _id = orderId;
        let query = `
            mutation OrderObject($_id: String!){
                refundOrder(_id: $_id){
                    _id
                }
            }
        `;
        $http({
            method: 'POST',
            url: '/graphql/order',
            data: { query, variables: { _id } }
        })
        .then(function (res) {
            
        });
    }

}]);

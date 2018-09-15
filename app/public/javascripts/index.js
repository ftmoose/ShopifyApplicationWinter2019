var createNewShop = function() {
    var name = document.getElementById('newShopName').value;
    var info = document.getElementById('newShopInfo').value;
    var query = `
        mutation ShopObject($name: String!, $info: String!){
            createShop(name: $name, info: $info){
                _id
            }
        }
    `;
    fetch('/graphql/shop', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            query,
            variables: { name, info }
        })
    })
    .then(r => r.json())
    .then((data) => {
        let shop = data.data.createShop;
        console.log(shop);
        location.reload();
    });
}
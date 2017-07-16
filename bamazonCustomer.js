const Inquirer = require('inquirer');
const amazonConnection = require('./connections.js').bamazon;
var quantity;

amazonConnection.connect(function(err){
	// Handle the error if there is one!
	if( err ) throw err;
	start();
});

var start = function() {
	amazonConnection.query( "SELECT * FROM products", function(err, res){
	if( err ) throw err;
	console.log("Welcome to bAmazon!");
	console.log("All the sales items are: ")
	console.log("========================");
	amazonConnection.queryAsync("SELECT * FROM products")
	.then( data =>{
	     			data.forEach(item => console.log(`${item.item_id}: ${item.product_name}: ${item.price}`));
	const questions = [
	{
		type : "text",
		name : "buy_id",
		message: "What is the ID of the product you would like to buy?"
	},
	{
		type : "text",
		name : "quantity",
		message : "How many units do you want to buy?"
	}	
	]
	// Create our Inquirer questions
	Inquirer.prompt(questions).then( (data) => {

	amazonConnection.queryAsync("SELECT price, stock_quantity FROM products WHERE item_id = ?",  [data.buy_id])
			.then(query => {
			   quantity = query[0].stock_quantity;
			   console.log("Quantity in stock: " + quantity);
			   console.log("Quantity you want to order: " + data.quantity);
			   if( parseInt(data.quantity) < quantity ){

				   var quantityLeft = quantity - parseInt(data.quantity);
			       console.log("Quantity left is: " + quantityLeft);
			       console.log("You purchase total is:" + data.quantity*query[0].price)
			       amazonConnection.queryAsync("UPDATE products SET stock_quantity = ? WHERE item_id = ?", [quantityLeft, data.buy_id]);
	           }
		       else
		       {
		       		console.log("Insufficient quantity!")
		       }

	        })
			.then(() => amazonConnection.end() );
	});     			
	    
	});
    });
}

/*
function run() {
	amazonConnection.query( "SELECT * FROM products", function(err, res){
			// Output the data
			if( err ) throw err;
			console.log("All the items are:");
			console.log("==============");
			amazonConnection.queryAsync("SELECT * FROM products")
				.then( data =>{
	     			data.forEach( item => console.log(`${item.item_id}: ${item.product_name}: ${item.price}`));

	     				const questions = [
	     				{
	     					type : "text",
	     					name : "item_id",
	     					message: "What is the ID of the product you would like to buy?"
	     				},
	     				{
	     					type : "text",
	     					name : "quantity",
	     					message : "How many units do you want to buy?"
	     				}	
	     				]
	     				// Create our Inquirer questions
	     				Inquirer.prompt(questions).then( (data) => {
	     				if( data.quantity > 0 ){
	     					console.log("Quantity: " + data.quantity);
	     					console.log("You order total is:" + data.quantity)
	     				}
	     				
	     				});
				});
				
			});

}

*/
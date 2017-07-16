const Inquirer = require('inquirer');
const amazonConnection = require('./connections.js').bamazon;
var quantity;

amazonConnection.connect(function(err){
	// Handle the error if there is one!
	if( err ) throw err;
	startManager();
});

var startManager = function() {
	const questions = [
	{
	  name: 'operation',
	  message: 'What would you like to do?',
	  type: 'list',
	  choices: [
		  {
		  	name: "View Products for Sale",
		  	value : "viewInventory"
		  },
		  {
		  	name: "View Low Inventory",
		  	value : "lowInventory"
		  },
		  {
		  	name: 'Add to Inventory',
		  	value : "addQuantity"
		  },
		  {
		  	name: "Add New Product",
		  	value: "addProduct"
		  }	  
	  ]
	} 
	]
	// Create our Inquirer questions
	Inquirer.prompt(questions).then( (data) => {
		switch (data.operation) {
        case "viewInventory":
          viewInventory();
          break;

        case "lowInventory":
          lowInventory();
          break;

        case "addQuantity":
          addQuantity();
          break;

        case "addProduct":
          addProduct();
          break;
      }
});

}

function viewInventory() {
	
	console.log("All the items are:");
	console.log("=====================================");
	amazonConnection.queryAsync("SELECT * FROM products")
	.then( data =>{
	    data.forEach( item => console.log(`${item.item_id} | ${item.product_name} | price : ${item.price} | ${item.stock_quantity} in stock`));
	})
	.then( () => console.log("=====================================") )
	.then( () => amazonConnection.end() );
}

function lowInventory() {
	console.log("Low instock items (fewer than 5) are:");
	console.log("=====================================");
	amazonConnection.queryAsync("SELECT * FROM products WHERE stock_quantity < 5")
	.then( data =>{
	    data.forEach( item => console.log(`${item.item_id} | ${item.product_name} | price : ${item.price} | ${item.stock_quantity} in stock`));
	})
	.then( () => console.log("=====================================") )
	.then( () => amazonConnection.end() );
}

function addQuantity() {
	amazonConnection.queryAsync("SELECT * FROM products").then( data => {
	data = data.map( item => {
		return {
			name : `${item.item_id} | ${item.product_name} | price : ${item.price} | ${item.stock_quantity} in stock`,
			value : item.item_id
			}
		});
		
	questions = [
	{
		name: 'itemChoice',
		message: 'Which item do you want to add its inventory?',
		type: 'list',
		choices: data
	},
	{
		name: 'addedQuantity',
		message: 'How many do you want to add to this product?',
		type: 'text'
	}];

	Inquirer.prompt(questions).then( (query) =>{
   			amazonConnection.queryAsync("SELECT stock_quantity FROM products WHERE item_id = ?", [query.itemChoice])
			.then( data => {var addStock = data[0].stock_quantity + parseInt(query.addedQuantity);
							amazonConnection.queryAsync("UPDATE products SET stock_quantity = ? WHERE item_id = ?", [addStock, query.itemChoice]);
		    })
			.then( () => { 
				amazonConnection.end();
				console.log("adding inventory is done!");

			})
			
			}).catch( err => { throw err });
			
		});
}


function addProduct() {
	const questions = [
			{
				type : "text",
				name : "item_id",
				message: "What is the item id you want to add?"
			},
			{
				type : "text",
				name : "product_name",
				message : "What is the product name?"
			},
			{
				type : "text",
				name : "department_name",
				message: "What department is this new product belong to?"
			},
			{
				type : "text",
				name : "price",
				message : "What is sale price for this new item?"
			},
			{
				type: "text",
				name: "stock_quantity",
				message: "How many do you want to add?"
			}
		];	

		Inquirer.prompt(questions).then( data => {
			const insertQuery = "INSERT INTO products ( item_id, product_name, department_name, price, stock_quantity ) VALUES (?, ?, ?, ?, ?)";

			amazonConnection.queryAsync(insertQuery, [data.item_id, data.product_name, data.department_name, data.price, data.stock_quantity])
				.then( () => console.log("New Item Added!") )
				.then( () => amazonConnection.end() );
		})
}


<!--
    Student Name: Sandeep N Raikar
    UTA ID : 1001103332
    URL Address: http://omega.uta.edu/~snr3332/project3/buy.php
-->
<html>
<head><title>Buy Products</title></head>
<body>
	<h1 align="center" style="color:orange">Programming Assignment - 3 | PHP Scripting </h1>
	<p>
		Shopping Basket
		.
	</p>
	<?php
	// Start the session
	session_start();
	if(empty($_SESSION['cart_items'])){
        	$_SESSION['cart_items'] = array();
	}


	if(isset($_GET['buy'])){
		
		$selectedProductId = (string)$_GET['buy'];
		$fetchProductDetailsURL = "http://sandbox.api.ebaycommercenetwork.com/publisher/3.0/rest/GeneralSearch?apiKey=78b0db8a-0ee1-4939-a2f9-d3cd95ec0fcc&trackingId=7000610&productId=";
		$fetchProductDetailsURL = $fetchProductDetailsURL . $_GET['buy'];
		$xmlProductStr = file_get_contents($fetchProductDetailsURL);
		$xmlProductData = new SimpleXMLElement($xmlProductStr);

		if(isset($xmlProductData)){
			$productXmlObject=$xmlProductData->categories[0]->category[0]->items[0]->product;
			$_SESSION['cart_items'][(string)$selectedProductId]=array("productId"=>$selectedProductId,"productOffersURL"=>(string)$productXmlObject->productOffersURL,"imageURL"=>(string)$productXmlObject->images[0]->image[0]->sourceURL,"productName"=>(string)$productXmlObject->name,"price"=>(string)$productXmlObject->minPrice);
		}
	}

	//Delete selected product from Shopping cart
	if(isset($_GET['delete'])){
		
		unset($_SESSION['cart_items'][$_GET['delete']]);
	}

	//Clear the session and Shopping cart
	if(isset($_GET['clear'])){
		
		unset($_SESSION['cart_items']);
	}

	//Display the shopping cart if there are items in the Session array
	if(isset($_SESSION['cart_items'])){

		displayShoppingCart();
	}else{
		echo 'Total Price: $0 <br>';
	}

	?>
	<br>
	<br>
	
	<!--This form is used for displaying the 'Empty Baskey' button-->
	<form action="buy.php" method="GET">
		<input type="hidden" name="clear" value="1"/>
		<input type="submit" value="Empty Basket"/>
	</form>

	<!-- This form is used for fetching the user input : CategoryId and Search Keyword -->
	<form method="GET" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]);?>">
		<fieldset>
			<legend>Find Products: </legend>
			<?php

			$loadCategoriesURL ="http://sandbox.api.ebaycommercenetwork.com/publisher/3.0/rest/CategoryTree?apiKey=78b0db8a-0ee1-4939-a2f9-d3cd95ec0fcc&visitorUserAgent&visitorIPAddress&trackingId=7000610&categoryId=72&showAllDescendants=true";
			$xmlCatStr = file_get_contents($loadCategoriesURL);
			$xmlCatData = new SimpleXMLElement($xmlCatStr);

			print '<label>Category: <select name="category">';
			print '<option value="' . $xmlCatData->category['id'] . '">' . $xmlCatData->category->name .'</option>';
			print '<optgroup label="' . $xmlCatData->category->name . ':">';
			foreach ($xmlCatData->category->categories->category as $category) {
				print '<option value="' . $category['id'] . '">' . $category->name .'</option>';
				print '<optgroup label="' . $category->name . ':">';

				foreach ($category->categories->category as $childValues) {
					if(!empty($childValues)){
						print '<option value="' . $childValues['id'] . '">' . $childValues->name .'</option>';
					}
				}
			}
			print '</select></label>';
			echo "\t\t\t\t\t";
			echo "&nbsp;&nbsp;&nbsp;&nbsp;" 
			?>

			<label>Search Keywords : <input type="text" name="search"/></label> 
			<input type="submit" value="Search"/>
		</fieldset>
	</form>

	<?php 
	error_reporting(E_ALL);
	ini_set('display_errors','On');

	function search(){
		$requestURL = "http://sandbox.api.ebaycommercenetwork.com/publisher/3.0/rest/GeneralSearch?apiKey=78b0db8a-0ee1-4939-a2f9-d3cd95ec0fcc&trackingId=7000610&";
		if (isset($_GET["search"]) && isset($_GET["category"])) {
			$requestURL = $requestURL . 'categoryId=' . $_GET["category"] . '&keyword=' . urlencode($_GET["search"]) . '&numItems=20';	
			if(strlen($_GET['search'])>0){
				$xmlstr = file_get_contents($requestURL);

				if(isset($xmlstr)){
					$xmlData = new SimpleXMLElement($xmlstr);
					displayResult($xmlData);			
				}
			}
		}
	}

	function displayShoppingCart(){
		print '<table border=1>';
		$totalPrice=0;
		foreach ($_SESSION as $cartItems) {		
			foreach ($cartItems as  $productArray) {
				print '<tr>';
				print '<td><a href="'. $productArray['productOffersURL'] . '"> <img src="'. $productArray['imageURL']  . '">' . '</a></td>';
				print '<td>'. $productArray['productName'] . '</td>';
				print '<td>'. $productArray['price'] . '</td>';			
				print '<td><a href=buy.php?delete=' . $productArray['productId'] . '>delete</td>' ;
				print '</tr>';
				$totalPrice+=$productArray['price'];
			}

			echo '<br>';
		}
		print '</table>';
		echo 'Total Price : $' . $totalPrice;
	}

	function displayResult($xmlData){
		//DISPLAY TABLE
		if(isset($xmlData)){

			print '<table border=1>';
			print '<tr>';
			print '<td>' . 'Item' . '</td>';
			print '<td>' . 'Name' . '</td>';
			print '<td>' . 'Price' . '</td>';
			print '<td>' . 'Description' . '</td>';
			print '<td>' . 'Offer URL' . '</td>';
			print '</tr>';
			foreach($xmlData->categories->category->items->product as $currRow) {
				print '<tr>';
				print '<td><a href="buy.php?buy='. $currRow['id'].'" onClick=testClick('.$currRow.');>' . '<img src="'. $currRow->images->image[0]->sourceURL . '">' . '</a></td>';
				print '<td>'. $currRow->name . '</td>';
				print '<td>'. $currRow->minPrice . '</td>';
				print '<td>'. $currRow->fullDescription . '</td>';
				print '<td> <a href="'. $currRow->productOffersURL . '">' . $currRow->productOffersURL.'</td>';
				print '</tr>';
			}
			print '</table>';
		}
	}
	search();
	?>
</body>
</html>

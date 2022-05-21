 //控制层 
app.controller('itemController' ,function($scope){	
	
	
	$scope.addNum=function(x){
		$scope.num+=x;
		if($scope.num<1){
			$scope.num=1;
		}
	}


	$scope.sepcificationitems={}//记录用户选择的规格
	//用户选择规格
	$scope.selectSpecification=function(name,value){
		$scope.sepcificationitems[name]=value;
		searchSku();//查询sku
	}
	
	//判断某规格选项是否被用户选中
	$scope.isSelected=function(name,value){
		if($scope.sepcificationitems[name]==value){
			return value;
		}else{
			return false;
		}
	}

	$scope.sku={};//当前选择的sku
	//加载默认SKU
	$scope.loadSku=function(){
		$scope.sku=skuList[0];
		$scope.sepcificationitems=JSON.parse(JSON.stringify($scope.sku.spec));//深拷贝
	}

	//匹配两个对象
	matchObject=function(map1,map2){
		for(var k in map1){
			if(map1[k]!=map2[k]){
				return false;
			}
		}

		for(var k in map2){
			if(map2[k]!=map1[k]){
				return false;
			}
		}

		return true;
	}


	//查询SKU
	searchSku=function(){
		for (let index = 0; index < skuList.length; index++) {
			if(matchObject(skuList[index].spec,$scope.sepcificationitems)){
				$scope.sku=skuList[index];
				return;
			}
			
		}

		$scope.sku={id:0,title:'-----------',price:0}//如果没有匹配的
	}

	//添加商品到购物车
	$scope.addToCart=function(){
		alert('skuID:' +$scope.sku.id);
	}
    
});	

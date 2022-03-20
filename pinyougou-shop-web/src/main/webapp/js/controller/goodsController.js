 //控制层 
app.controller('goodsController' ,function($scope,$controller   ,goodsService,uploadService,itemCatService){
	
	$controller('baseController',{$scope:$scope});//继承
	
    //读取列表数据绑定到表单中  
	$scope.findAll=function(){
		goodsService.findAll().success(
			function(response){
				$scope.list=response;
			}			
		);
	}    
	
	//分页
	$scope.findPage=function(page,rows){			
		goodsService.findPage(page,rows).success(
			function(response){
				$scope.list=response.rows;	
				$scope.paginationConf.totalItems=response.total;//更新总记录数
			}			
		);
	}
	
	//查询实体 
	$scope.findOne=function(id){				
		goodsService.findOne(id).success(
			function(response){
				$scope.entity= response;					
			}
		);				
	}
	
	//保存 
	$scope.add=function(){


		$scope.entity.goodsDesc.introduction=editor.html();//商品介绍

		goodsService.add( $scope.entity  ).success(
			function(response){
				alert(response.message);
				if(response.success){
					//重新查询 
		        	$scope.entity={};
		        	editor.html("")//清空富文本编辑器
				}
			}		
		);				
	}
	
	 
	//批量删除 
	$scope.dele=function(){			
		//获取选中的复选框			
		goodsService.dele( $scope.selectIds ).success(
			function(response){
				if(response.success){
					$scope.reloadList();//刷新列表
					$scope.selectIds=[];
				}						
			}		
		);				
	}
	
	$scope.searchEntity={};//定义搜索对象 
	
	//搜索
	$scope.search=function(page,rows){			
		goodsService.search(page,rows,$scope.searchEntity).success(
			function(response){
				$scope.list=response.rows;	
				$scope.paginationConf.totalItems=response.total;//更新总记录数
			}			
		);
	}

	$scope.image_entity={};

	$scope.uploadImage=function (){
		uploadService.upload().success(function (response){
			if(response.error==0){
				$scope.image_entity.url=response.url;

			}
		})
	}

	$scope.entity={goods:{},goodsDesc:{itemImages:[]}};//商品实体
	$scope.add_image_entity=function (){
		$scope.entity.goodsDesc.itemImages.push($scope.image_entity)
	}

	$scope.remove_image_entity=function (index){
		$scope.entity.goodsDesc.itemImages.splice(index,1)
	}


	//查询商品一级分类列表
	$scope.selectItemCat1List=function (){
		itemCatService.findByParentId(0).success(function (response){
			$scope.itemCat1List=response;
		})
	}


	//变量监控 查询商品二级分类列表
	$scope.$watch("entity.goods.category1Id",function (newValue,oldValue){
		itemCatService.findByParentId(newValue).success(function (response){
			$scope.itemCat2List=response;
		})
	})

	//变量监控 查询商品三级分类列表
	$scope.$watch("entity.goods.category2Id",function (newValue,oldValue){
		itemCatService.findByParentId(newValue).success(function (response){
			$scope.itemCat3List=response;
		})
	})

	//查询模板ID
	$scope.$watch("entity.goods.category3Id",function (newValue,oldValue){
		itemCatService.findOne(newValue).success(function (response){
			$scope.entity.goods.typeTemplateId = response.typeId;//模板ID
		})


	})
});

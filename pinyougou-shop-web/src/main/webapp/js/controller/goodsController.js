 //控制层 
app.controller('goodsController' ,function($scope,$controller   ,$location,goodsService,uploadService,itemCatService,typeTemplateService){
	
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
	$scope.findOne=function(){

		var id = $location.search()['id'];//获取参数值
		if(id==null){
			return;
		}
		goodsService.findOne(id).success(
			function(response){
				$scope.entity= response;
				//向富文本编辑器添加商品介绍
				editor.html($scope.entity.goodsDesc.introduction);

				//显示图片列表
				$scope.entity.goodsDesc.itemImages=JSON.parse($scope.entity.goodsDesc.itemImages)

				//显示扩展属性
				$scope.entity.goodsDesc.customAttributeItems=JSON.parse($scope.entity.goodsDesc.customAttributeItems);

				//读取规格
				$scope.entity.goodsDesc.specificationItems=JSON.parse($scope.entity.goodsDesc.specificationItems);

				//SKU列表规格列转换
				for (let i = 0; i < $scope.entity.itemList.length; i++) {
					$scope.entity.itemList[i].spec = JSON.parse($scope.entity.itemList[i].spec);
				}
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

	$scope.entity={goods:{},goodsDesc:{itemImages:[],specificationItems:[]}};//商品实体
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
	//查询品牌列表
	$scope.$watch("entity.goods.typeTemplateId",function (newValue,oldValue){
		typeTemplateService.findOne(newValue).success(function (response){
			$scope.typeTemplate = response;//模板ID
			$scope.typeTemplate.brandIds = JSON.parse($scope.typeTemplate.brandIds)//品牌列表由字符串转换为对象

			//如果没有ID,则加载模板中的扩展数据
			if($location.search()['id']==null){
				$scope.entity.goodsDesc.customAttributeItems = JSON.parse($scope.typeTemplate.customAttributeItems)//扩展属性
			}

		})
		typeTemplateService.findSpecList(newValue).success(function (response){
			$scope.specList = response;
		})


	})

	//更新选中的规格
	//[{"attributeName":"网络制式","attributeValue":["移动3G","移动4G"]},{"attributeName":"屏幕尺寸","attributeValue":["6寸","5寸"]}]
	$scope.updateSpecItems=function ($event,name,value){
		//思路 在集合中中查询规格名称为某值的对象
		var object =  $scope.searchObjectByKey($scope.entity.goodsDesc.specificationItems,"attributeName",name);
		if(object!=null){
			//有此规格
			if($event.target.checked){
				object.attributeValue.push(value);
			}else {
				object.attributeValue.splice(object.attributeValue.indexOf(value),1);
				if(object.attributeValue.length==0){
					$scope.entity.goodsDesc.specificationItems.splice($scope.entity.goodsDesc.specificationItems.indexOf(object),1);
				}
			}
		}else {//没有此规格，添加规格记录
			$scope.entity.goodsDesc.specificationItems.push({"attributeName":name,"attributeValue":[value]});

		}
	}


	//创建SKU列表
	$scope.createItemList=function (){
		$scope.entity.itemList=[{spec:{},price:0,num:999,status:"1",isDefault:"0"}];

		var items = $scope.entity.goodsDesc.specificationItems;
		for (let i = 0; i < items.length; i++) {

			$scope.entity.itemList = addColumn($scope.entity.itemList,items[i].attributeName,items[i].attributeValue);

		}
	}


	//添加列值
	addColumn=function (list,columnName,columnValues){

		var newList = []; //新的集合
		for (let i = 0; i < list.length; i++) {
			var oldRow = list[i];
			for (let j = 0; j < columnValues.length; j++) {
				var newRow = JSON.parse(JSON.stringify(oldRow));//深克隆
				newRow.spec[columnName]=columnValues[j];
				newList.push(newRow);
			}
		}

		return newList;
	}

	$scope.status=['未审核','已审核','审核未通过','已关闭']

	$scope.itemCatList=[];//商品分类列表

	//加载商品分类列表
	$scope.findItemCatList=function (){
		itemCatService.findAll().success(function (response){
			for (let i = 0; i < response.length; i++) {
				$scope.itemCatList[response[i].id] = response[i].name;
			}
		})
	}

	//根据规格名称和选项名称返回是否被勾选
	$scope.checkAttributeValue=function (specName,optionName){
		var items = $scope.entity.goodsDesc.specificationItems;
		var obj = $scope.searchObjectByKey(items,'attributeName',specName,specName);
		if(obj==null){
			return false;
		}else {
			if(obj.attributeValue.indexOf(optionName)>=0){
				return  true;
			}else {
				return false;
			}
		}
	}





});

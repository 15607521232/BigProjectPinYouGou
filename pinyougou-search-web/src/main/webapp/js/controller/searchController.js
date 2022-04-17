app.controller('searchController',function ($scope,searchService){

    //定义搜索对象的结构
    $scope.searchMap={'keywords':'','category':'','brand':'','spec':{}};

    $scope.search=function (){
        searchService.search($scope.searchMap).success(
            function (response){
                $scope.resultMap=response;
            }
        )
    }

    //添加搜索项
    $scope.addSearchItem=function (key,value){
        if(key=='category'|| key=='brand'){//如果点击的是分类或者品牌
            $scope.searchMap[key]=value;
        }else {//如果点击的是规格
            $scope.searchMap.spec[key]=value;
        }
        $scope.search();//执行搜索
    }


    //添加移除复合搜索条件
    $scope.removeSearchItem=function (key){
        if(key=='category' || key=='brand'){
            $scope.searchMap[key]="";
        }else {
            delete $scope.searchMap.spec[key];
        }
        $scope.search();//执行搜索
    }

})
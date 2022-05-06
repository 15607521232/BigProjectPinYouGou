app.controller('searchController',function ($scope,searchService){

    //定义搜索对象的结构
    $scope.searchMap={'keywords':'','category':'','brand':'','spec':{},'price':'','pageNo':1,'pageSize':40,'sort':'','sortField':''};

    $scope.search=function (){
        $scope.searchMap.pageNo=parseInt($scope.searchMap.pageNo);//转换为数字
        searchService.search($scope.searchMap).success(
            function (response){
                $scope.resultMap=response;
                //$scope.searchMap.pageNo=1;
                buildPageLabel();

            }
        )
    }

    //构建分页栏
    buildPageLabel=function (){

        $scope.pageLabel=[];
        var firstPage=1;
        var lastPage=$scope.resultMap.totalPages;//终止页码
        $scope.firstDot=true;//前面有点
        $scope.lastDot=true;//后面有点

        if($scope.resultMap.totalPages>5){
            //如果页码数大于5
            if($scope.searchMap.pageNo<=3){
                //显示前5页
                lastPage=5;
                $scope.firstDot=false;//前面没点
            }else if($scope.searchMap.pageNo>=$scope.resultMap.totalPages-2){
                firstPage=$scope.resultMap.totalPages-4;
                $scope.lastDot=false;//后面没点

            }else {
                //显示当前页为中心的5页
                firstPage=$scope.searchMap.pageNo-2;
                lastPage=$scope.searchMap.pageNo+2;
            }
        }else {
            $scope.firstDot=false;//前面有点
            $scope.lastDot=false;//后面有点
        }
        for (let i = firstPage; i <= lastPage; i++) {
            $scope.pageLabel.push(i);
        }
    }

    //添加搜索项
    $scope.addSearchItem=function (key,value){
        if(key=='category'|| key=='brand'|| key=='price'){//如果点击的是分类或者品牌
            $scope.searchMap[key]=value;
        }else {//如果点击的是规格
            $scope.searchMap.spec[key]=value;
        }
        $scope.search();//执行搜索
    }


    //添加移除复合搜索条件
    $scope.removeSearchItem=function (key){
        if(key=='category' || key=='brand' || key=='price'){
            $scope.searchMap[key]="";
        }else {
            delete $scope.searchMap.spec[key];
        }
        $scope.search();//执行搜索
    }

    //分页查询
    $scope.queryByPage=function (pageNo){
        if(pageNo<1 || pageNo>$scope.resultMap.totalPages){
            return;
        }
        $scope.searchMap.pageNo=pageNo;
        $scope.search();
    }


    //判断当前页是否为第一页
    $scope.isTopPage=function (){
        if($scope.searchMap.pageNo==1){
            return true;
        }else {
            return false;
        }
    }

    $scope.isEndPage=function (){
        if($scope.searchMap.pageNo==$scope.resultMap.totalPages){
            return true;
        }else {
            return false;
        }
    }

    $scope.sortSearch=function (sortField,sort) {
        $scope.searchMap.sortField=sortField;
        $scope.searchMap.sort=sort;

        $scope.search();
    }





})
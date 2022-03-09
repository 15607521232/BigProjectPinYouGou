//控制层
app.controller('brandController',function ($scope,$controller, brandService) {


    $controller('baseController',{$scope:$scope});//继承
    $scope.findAll=function () {
        brandService.findAll().success(function (response) {
            $scope.list=response;
        })
    };

    //分页
    $scope.findPage=function (page,rows) {
        brandService.findPage(page,rows).success(function (response){
            $scope.list=response.rows;
            $scope.paginationConf.totalItems=response.total;
        })
    };
    
    //查询实体
    $scope.findOne=function (id) {
        brandService.findOne(id).success(function (response) {
            $scope.entity=response;
        })
    };
    
    //保存
    $scope.save=function () {
        var object=null;
        if($scope.entity.id!=null){
            object=brandService.update($scope.entity);
        }else{
            object=brandService.add($scope.entity);
        }

        object.success(function (response) {
            if(response.success){
                $scope.reloadList();
            }else {
                alert(response.message);
            }
        })
    };


    //搜索
    $scope.searchEntity={};
    $scope.search=function (page,rows) {
        brandService.search(page,rows,$scope.searchEntity).success(function (response) {
            $scope.list=response.rows;
            $scope.paginationConf.totalItems=response.total;
        })

    };


    //删除
    $scope.dele=function () {
        if($scope.selectIds.length==0){
            alert("请选择");
            return;
        }

        brandService.dele($scope.selectIds).success(function (response) {
            if(response.success){
                $scope.reloadList();
                $scope.selectIds=[];

            }else {
                alert(response.message);
            }
        })
    }


});
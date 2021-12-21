//控制层
app.controller('brandController',function ($scope,brandService) {


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

    $scope.paginationConf={
        currentPage: 1,//当前页
        totalItems: 10,//总记录数
        itemsPerPage: 10,//每页记录书
        perPageOptions: [10, 20, 30, 40, 50],//页码选项
        onChange: function(){//当页码发生变化的时候自动触发的方法
            $scope.reloadList();//重新加载记录
        }

    };

    $scope.reloadList=function () {
        $scope.search($scope.paginationConf.currentPage,$scope.paginationConf.itemsPerPage);
    };


    $scope.selectIds=[];//选中的ID数组

    $scope.updateSelection=function($event,id) {
        if($event.target.checked){
            $scope.selectIds.push(id);
        }else {
            //splice 从数组中删除一个元素
            var idx = $scope.selectIds.indexOf(id);
            $scope.selectIds.splice(idx, 1);


        }
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
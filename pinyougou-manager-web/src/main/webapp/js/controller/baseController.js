//控制层
app.controller('baseController',function ($scope) {

    $scope.reloadList=function () {
        $scope.search($scope.paginationConf.currentPage,$scope.paginationConf.itemsPerPage);
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

});
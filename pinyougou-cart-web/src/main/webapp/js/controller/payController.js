app.controller('payController',function ($scope,$location,payService){
    //本地生成二维码
    $scope.createNative=function (){
        payService.createNative().success(
            function (response){
                $scope.total_fee=(response.total_fee/100).toFixed(2);
                $scope.out_trade_no=response.out_trade_no;
                var qr = QRious({
                    element:document.getElementById("qrious"),
                    size:250,
                    level:'H',
                    value:response.code_url
                })
                queryPayStatus(response.out_trade_no);

            }
        )
    }

    queryPayStatus=function (out_trade_no){
        payService.queryPayStatus(out_trade_no).success(
            function (response){
                if(response.success){
                    location.href="paysuccess.html#?total_fee="+$scope.total_fee;
                }else {
                    if(response.message=='二维码超时'){
                        $scope.createNative();
                    }else {
                        location.href="payfail.html";
                    }
                }

            }
        )
    }

    $scope.getMoney=function (){
        return $location.search()['total_fee']
    }
})
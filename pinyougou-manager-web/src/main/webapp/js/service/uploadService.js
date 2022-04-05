//服务层
app.service('uploadService',function($http){

    //读取列表数据绑定到表单中
    this.uploadFile=function(){

        var formData = new FormData();//表单数据对象
        formData.append("imgFile",imgFile.files[0]);
        return $http({
            url:"../upload.do",
            method:"POST",
            data:formData,
            headers:{"Content-Type":undefined},
            transformRequest:angular.identity //表单序列化
        })
    }
});

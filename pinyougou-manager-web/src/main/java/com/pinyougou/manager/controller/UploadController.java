package com.pinyougou.manager.controller;

import com.alibaba.fastjson.JSON;
import entity.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import util.FastDFSClient;

import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

@RestController
public class UploadController {

    //获取dfs服务器
    @Value("${FILE_SERVER_URL}")
    private String file_server_url;



    @RequestMapping("/upload")
    public Result upload(MultipartFile imgFile){

        //获取文件名
        String originalFileName = imgFile.getOriginalFilename();
        String extName = originalFileName.substring(originalFileName.lastIndexOf(".")+1);

        try {
            util.FastDFSClient client = new FastDFSClient("classpath:config/fdfs_client.conf");
            String fileId = client.uploadFile(imgFile.getBytes(),extName);
            String url =file_server_url+fileId;//图片完整地址
            return new Result(true,url);
        }catch (Exception e){
            e.printStackTrace();
            return new Result(false,"上传失败");

        }


    }
}

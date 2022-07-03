package com.pinyougou.cart.controller;


import com.alibaba.dubbo.config.annotation.Reference;
import com.alibaba.fastjson.JSON;
import com.pinyougou.cart.service.CartService;
import com.pinyougou.pojogroup.Cart;
import entity.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.List;

@RestController
@RequestMapping("/cart")
public class CartController {


    @Reference
    private CartService cartService;

    @Autowired
    private HttpServletRequest request;

    @Autowired
    private HttpServletResponse response;



    @RequestMapping("/findCartList")
    public List<Cart> findCartList(){
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        String cartListString = util.CookieUtil.getCookieValue(request,"cartList","UTF-8");

            if(cartListString==null || cartListString.equals("")){
                cartListString="[]";
            }
            List<Cart> cartList_cookie = JSON.parseArray(cartListString,Cart.class);

        if(username.equals("anonymousUser")){
            return cartList_cookie;
        }
        else{
            List<Cart> cartList_redis = cartService.findCartListFromRedis(username);
            if(cartList_cookie.size()>0){
                cartList_redis=cartService.mergeCartList(cartList_redis,cartList_cookie);
                //清除本地cookie数据
                util.CookieUtil.deleteCookie(request,response,"cartList");
                //将合并后的数据存入redis
                cartService.saveCartListToRedis(username,cartList_redis);
            }
            return cartList_redis;

        }

    }


    @RequestMapping("/addGoodsToCartList")
    @CrossOrigin(origins = "http://localhost:9105")//跨域注解
    public Result addGoodsToCartList(Long itemId,Integer num){

        //response.setHeader("Access-Control-Allow-Origin","http://localhost:9105");//可以访问的域，当此方法不需要操作Cookie
        //response.setHeader("Access-Control-Allow-Credentials","true");

        String username = SecurityContextHolder.getContext().getAuthentication().getName();


        try{
            List<Cart> cartList = findCartList();
            cartList = cartService.addGoodsToCartList(cartList,itemId,num);
            if(username.equals("anonymousUser")){ //未登录
                util.CookieUtil.setCookie(request,response,"cartList",JSON.toJSONString(cartList),3600*24,"UTF-8");

            }else {
                cartService.saveCartListToRedis(username,cartList);

            }
            return new Result(true,"添加成功");

        }catch (Exception e){
            e.printStackTrace();
            return new Result(false,"添加失败");
        }
    }

}

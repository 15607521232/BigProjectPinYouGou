package com.pinyougou.cart.service;

import com.pinyougou.pojogroup.Cart;

import java.util.List;

/**
 * 购物车服务接口
 */

public interface CartService {
    /**
     * 添加商品到购物车
     */

    public List<Cart> addGoodsToCartList(List<Cart> cartList,Long itemId,Integer num);

    /**
     * 从redis查询购物车
     */

    public List<Cart> findCartListFromRedis(String username);

    /**
     * 将购物车列表存储到redis
     */
    public void saveCartListToRedis(String username,List<Cart> cartList);

    /**
     * 合并购物车
     */
    public List<Cart> mergeCartList(List<Cart> cartList1,List<Cart> cartList2);
}

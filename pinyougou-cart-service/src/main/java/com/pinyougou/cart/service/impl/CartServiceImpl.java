package com.pinyougou.cart.service.impl;

import com.alibaba.dubbo.config.annotation.Service;
import com.pinyougou.cart.service.CartService;
import com.pinyougou.mapper.TbItemMapper;
import com.pinyougou.pojo.TbItem;
import com.pinyougou.pojo.TbOrderItem;
import com.pinyougou.pojogroup.Cart;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class CartServiceImpl implements CartService {

    @Autowired
    private TbItemMapper itemMapper;
    @Override
    public List<Cart> addGoodsToCartList(List<Cart> cartList, Long itemId, Integer num) {
        /**
         * 1.根据商品SKU ID 查询SKU的详细信息
         * 2.获取商家ID
         * 3.根据商家ID判断购物车列表中是否存在该商家的购物车
         * 4.如果购物车列表中不存在该商品的购物车
         *  4，1新建购物车对象
         *  4.2将新建的购物车对象添加到购物车列表
         * 5.如果购物车列表中存在该商品的购物车
         * 查询购物陈明心列表中是否存在该商品
         *  5.1 如果没有，新增购物车明细
         *  5.2如果有，在原购物车明细上添加数量，更改金额
         */

        TbItem item = itemMapper.selectByPrimaryKey(itemId);

        if(item==null){
            throw new RuntimeException("商品不存在");
        }
        if(!item.getStatus().equals("1")){
            throw new RuntimeException("商品状态不合法");
        };

        String sellerId = item.getSellerId();

        Cart cart = searchCartBySellerId(cartList,sellerId);

        if(cart==null){
            cart = new Cart();
            cart.setSellerId(sellerId);
            cart.setSellerName(item.getSeller());
            TbOrderItem tbOrderItem = createorderItem(item,num);
            List<TbOrderItem> tbOrderItemList = new ArrayList<>();
            tbOrderItemList.add(tbOrderItem);
            cart.setOrderItemList(tbOrderItemList);
            cartList.add(cart);

        }else {
            TbOrderItem tbOrderItem = searchOrderItemByItemId(cart.getOrderItemList(),itemId);
            if(tbOrderItem==null){
                tbOrderItem=createorderItem(item,num);
                cart.getOrderItemList().add(tbOrderItem);
            }else {
                tbOrderItem.setNum(tbOrderItem.getNum()+num);
                tbOrderItem.setTotalFee(new BigDecimal(tbOrderItem.getNum()*tbOrderItem.getPrice().doubleValue()));

                if(tbOrderItem.getNum()<=0){
                    cart.getOrderItemList().remove(tbOrderItem);

                }
                if(cart.getOrderItemList().size()==0){
                    cartList.remove(cart);
                }
            }
        }
        return cartList;


    }



    private Cart searchCartBySellerId(List<Cart> cartList,String sellerId){
        for (Cart cart:cartList){
            if(cart.getSellerName().equals(sellerId)){
                return cart;
            }
        }
        return null;
    }
    private TbOrderItem searchOrderItemByItemId(List<TbOrderItem> orderItemList,Long itemId){
        for (TbOrderItem tbOrderItem:orderItemList){
            if(tbOrderItem.getItemId().longValue()==itemId.longValue()){
                return tbOrderItem;
            }
        }
        return null;
    }

    private TbOrderItem createorderItem(TbItem tbItem,Integer num){

        TbOrderItem orderItem = new TbOrderItem();
        orderItem.setGoodsId(tbItem.getGoodsId());
        orderItem.setItemId(tbItem.getId());
        orderItem.setNum(num);
        orderItem.setPicPath(tbItem.getImage());
        orderItem.setPrice(tbItem.getPrice());
        orderItem.setSellerId(tbItem.getSellerId());
        orderItem.setTitle(tbItem.getTitle());
        orderItem.setTotalFee(new BigDecimal(tbItem.getPrice().doubleValue()*num));
        return orderItem;
    }
}

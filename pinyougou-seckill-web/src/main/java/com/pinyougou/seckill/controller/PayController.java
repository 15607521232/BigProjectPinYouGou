package com.pinyougou.seckill.controller;


import com.alibaba.dubbo.config.annotation.Reference;
import com.pinyougou.pay.service.WeixinPayService;
import com.pinyougou.pojo.TbSeckillOrder;
import com.pinyougou.seckill.service.SeckillOrderService;
import entity.Result;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/pay")
public class PayController {

    @Reference
    private WeixinPayService weixinPayService;

    @Reference
    private SeckillOrderService seckillOrderService;


    @RequestMapping("/createNative")
    public Map createNative(){

        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        TbSeckillOrder seckillOrder = seckillOrderService.searchOrderFromRedisByUserId(userId);
        if(seckillOrder!=null){
            return weixinPayService.createNative(seckillOrder.getId()+"",(long)(seckillOrder.getMoney().doubleValue()*100)+"");
        }

        return new HashMap();
    }

    @RequestMapping("/queryPayStatus")
    public Result queryPayStatus(String out_trade_no){

        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        Result result = null;
        int x = 0;
        while (true){
            Map<String,String> map = weixinPayService.queryPayStatus(out_trade_no);
            if(map==null){
                result = new Result(false,"支付出错");
                break;
            }

            if(map.get("trade_state").equals("SUCCESS")){
                result = new Result(true,"支付成功");
                //修改订单状态
              seckillOrderService.saveOrderFromRedisToDb(userId,Long.valueOf(out_trade_no),map.get("transaction_id"));
                break;
            }

            try {
                Thread.sleep(3000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }

            //为了不让循环无休止的执行，我们定义一个循环变量，如果这个变量超过了这个值则退出循环，设置时间为五分钟
            x++;
            if(x>=100){
                result = new Result(false,"二维码超时");
                Map<String,String> payresult = weixinPayService.closePay(out_trade_no);
                if(!"SUCCESS".equals(payresult.get("result_code"))){
                    if("ORDERPAID".equals(payresult.get("err_code"))){
                        result = new Result(true,"支付成功");
                        seckillOrderService.saveOrderFromRedisToDb(userId,Long.valueOf(out_trade_no),map.get("transaction_id"));
                    }
                }

                if(result.isSuccess()==false){
                    System.out.println("超时，取消订单");
                    //删除订单
                    seckillOrderService.deleteOrderFromRedis(userId,Long.valueOf(out_trade_no));
                }

                break;
            }
        }
        return result;
    }


}

package com.pinyougou.task;


import com.pinyougou.mapper.TbSeckillGoodsMapper;
import com.pinyougou.pojo.TbSeckillGoods;
import com.pinyougou.pojo.TbSeckillGoodsExample;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Set;

@Component
public class SeckillTask {

    @Autowired
    private RedisTemplate redisTemplate;

    private TbSeckillGoodsMapper seckillGoodsMapper;

    @Scheduled(cron = "0 * * * * ?")
    public void refreshSeckillGoods(){
        System.out.println("执行了任务调度"+new Date());



        //获取秒杀商品列表
        List ids =new ArrayList<>(redisTemplate.boundHashOps("seckillGoods").keys()) ;
        System.out.println(ids);
        TbSeckillGoodsExample example = new TbSeckillGoodsExample();
        TbSeckillGoodsExample.Criteria criteria = example.createCriteria();
        criteria.andStatusEqualTo("1");
        criteria.andStockCountGreaterThan(0);
        criteria.andStartTimeLessThanOrEqualTo(new Date());
        criteria.andEndTimeGreaterThanOrEqualTo(new Date());
        criteria.andIdNotIn(ids);
        List<TbSeckillGoods> seckillGoodsList = seckillGoodsMapper.selectByExample(example);

        //将商品列表装入缓存
        System.out.println("将秒杀商品列表装入缓存");
        for (TbSeckillGoods seckillGoods:seckillGoodsList){
            redisTemplate.boundHashOps("seckillGoods").put(seckillGoods.getId(),seckillGoods);
            System.out.println("增量更新秒杀商品ID" + seckillGoods.getId());
        }
        System.out.println("-------------end----------");
        System.out.println("将"+ seckillGoodsList.size()+"条商品放入缓存");



    }

    /**
     * 移除秒杀商品
     */
    @Scheduled(cron = "0 * * * * ?")
    public void removeSeckillGoods(){

        System.out.println("移除秒杀商品任务");

        List<TbSeckillGoods> seckillGoodsList = redisTemplate.boundHashOps("seckillGoods").values();

        for (TbSeckillGoods seckillGoods:seckillGoodsList){
            if(seckillGoods.getEndTime().getTime()<new Date().getTime()){
                seckillGoodsMapper.updateByPrimaryKey(seckillGoods);
                redisTemplate.boundHashOps("seckillGoods").delete(seckillGoods.getId());
                System.out.println("移除秒杀商品" +seckillGoods.getId());
            }

            System.out.println("移除结束");


        }


    }


}

package com.pinyougou.solrutil;


import com.alibaba.fastjson.JSON;
import com.pinyougou.mapper.TbItemMapper;
import com.pinyougou.pojo.TbItem;
import com.pinyougou.pojo.TbItemExample;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.data.solr.core.SolrTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

//将工具类按照Bean的形式加载
@Component
public class SolrUtil {

    @Autowired
    private TbItemMapper itemMapper;

    @Autowired
    private SolrTemplate solrTemplate;

    /**
     * 导入商品数据
     */

    public void importItemData(){

        TbItemExample example = new TbItemExample();
        TbItemExample.Criteria criteria = example.createCriteria();
        criteria.andStatusEqualTo("1");//已审核的数据
        List<TbItem> itemList = itemMapper.selectByExample(example);
        System.out.println("====商品列表====");
        for (TbItem item: itemList){
            System.out.println(item.getTitle() + "  " + item.getBrand() + "  " + item.getPrice());
            Map specMap = JSON.parseObject(item.getSpec());//将spec字段中的json字符串转换为map
            item.setSpecMap(specMap);//给带注解的字段赋值
        }
        System.out.println("===结束===");
        solrTemplate.saveBeans(itemList);
        solrTemplate.commit();

    }

    public static void main(String[] args) {
        ApplicationContext context = new ClassPathXmlApplicationContext("classpath*:spring/applicationContext*.xml");//classpath*:spring/applicationContext*.xml 带*是为了加载jar包中带的dao的spring配置文件
        SolrUtil solrUtil = (SolrUtil) context.getBean("solrUtil");
        solrUtil.importItemData();
    }
}

package com.pinyougou.search.service.impl;

import com.alibaba.dubbo.config.annotation.Service;
import com.pinyougou.pojo.TbItem;
import com.pinyougou.search.service.ItemSearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.solr.core.SolrTemplate;
import org.springframework.data.solr.core.query.*;
import org.springframework.data.solr.core.query.result.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service(timeout = 5000)
public class ItemSearchServiceImpl implements ItemSearchService {



    @Autowired
    private SolrTemplate solrTemplate;

    @Override
    public Map<String, Object> search(Map searchMap) {


        Map map = new HashMap();

        //查询列表
        map.putAll(searchList(searchMap));

        //分组查询 商品分类列表
        List<String> categoryList = searchCategoryList(searchMap);
        map.put("categoryList",categoryList);

        //查询品牌和规格列表
        if(categoryList.size()>0){
            map.putAll(searchBrandAndSpecList(categoryList.get(0)));
        }

        //查询品牌和规格列表
        String categoryName = (String) searchMap.get("category");
        if(!"".equals(categoryName)){
            map.putAll(searchBrandAndSpecList(categoryName));
        }else {
            if(categoryList.size()>0){
                map.putAll(searchBrandAndSpecList(categoryList.get(0)));
            }
        }

        return map;






    }


    //查询列表
    private Map searchList(Map searchMap){
        Map map = new HashMap();

        //高亮选项初始化
        HighlightQuery query = new SimpleHighlightQuery();
        HighlightOptions highlightOptions = new HighlightOptions().addField("item_title");//设置高亮的域

        highlightOptions.setSimplePrefix("<em style='color:red'>");
        highlightOptions.setSimplePostfix("</em>");
        query.setHighlightOptions(highlightOptions);//设置高亮选项

        //1.1按照关键字查询
        Criteria criteria = new Criteria("item_keywords").is(searchMap.get("keywords"));
        query.addCriteria(criteria);

        //1.2按照商品分类过滤

        if(!"".equals(searchMap.get("category"))){//如果用户选择了分类
            Criteria filterCriteria = new Criteria("item_category").is(searchMap.get("category"));
            FilterQuery filterQuery = new SimpleFilterQuery(filterCriteria);
            query.addFilterQuery(filterQuery);
        }

        //1.3按照品牌筛选
        if(!"".equals(searchMap.get("brand"))){//如果用户选择了分类
            Criteria filterCriteria = new Criteria("item_brand").is(searchMap.get("brand"));
            FilterQuery filterQuery = new SimpleFilterQuery(filterCriteria);
            query.addFilterQuery(filterQuery);
        }

        //1.4 按照规格过滤
        if(searchMap.get("spec")!=null){//如果用户选择了分类
            Map<String,String> specMap = (Map<String, String>) searchMap.get("spec");
            for (String key:specMap.keySet()){
                Criteria filterCriteria = new Criteria("item_spec"+key).is(searchMap.get(key));
                FilterQuery filterQuery = new SimpleFilterQuery(filterCriteria);
                query.addFilterQuery(filterQuery);
            }

        }




        //高亮页对象
        HighlightPage<TbItem> page = solrTemplate.queryForHighlightPage(query,TbItem.class);
        for (HighlightEntry<TbItem> h: page.getHighlighted()){//循环高亮入口集合
            TbItem item = h.getEntity();//获取原实体类
            if(h.getHighlights().size()>0 && h.getHighlights().get(0).getSnipplets().size()>0){
                item.setTitle(h.getHighlights().get(0).getSnipplets().get(0));//设置高亮的结果
            }

        }
        map.put("rows",page.getContent());
        return map;
    }

    //分组查询（查询商品分类列表）
    private List<String> searchCategoryList(Map searchMap){

        List<String> list = new ArrayList();

        Query query = new SimpleQuery("*:*");

        //关键字查询  where
        Criteria criteria = new Criteria("item_keywords").is(searchMap.get("keywords"));
        query.addCriteria(criteria);

        //设置分组选项
        GroupOptions groupOptions = new GroupOptions().addGroupByField("item_category");//group by
        query.setGroupOptions(groupOptions);

        //获取分组页
        GroupPage<TbItem> page = solrTemplate.queryForGroupPage(query, TbItem.class);
        //获取分组结果对象
        GroupResult<TbItem> groupResultCategory = page.getGroupResult("item_category");

        //获取分组入口页
        Page<GroupEntry<TbItem>> groupEntries = groupResultCategory.getGroupEntries();

        //获取分组入口集合
        List<GroupEntry<TbItem>> entryList = groupEntries.getContent();

        for(GroupEntry<TbItem> entry:entryList){
            list.add(entry.getGroupValue());
        }

        return list;



    }

    @Autowired
    private RedisTemplate redisTemplate;

    //查询品牌和规格列表 根据分类名称
    private Map searchBrandAndSpecList(String category){

        Map map = new HashMap();
        Long templateId = (Long) redisTemplate.boundHashOps("itemCat").get(category);//获取模板ID
        if(templateId!=null){
            //根据模板ID查询品牌列表
            List brandList = (List)redisTemplate.boundHashOps("brandList").get(templateId);
            map.put("brandList",brandList);

            //根据模板ID查询规格列表
            List specList = (List) redisTemplate.boundHashOps("specList").get(templateId);
            map.put("specList",specList);
        }


        return map;
    }
}

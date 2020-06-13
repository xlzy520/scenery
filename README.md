基于unia-pp市场的签到打卡小程序开发，增加天气查询和路线规划。
## 使用方法

因为只是在微信小程序中使用，所以一些相关的 SDK 都是腾讯地图的，如果需要在其他端使用，请自行修改。

1、先去腾讯地图申请一个 KEY：[去申请](https://lbs.qq.com)  
2、将申请的 KEY 填入项目`config\index.js`中的`MAP_KEY`  
3、`manifest.json`中配置上自己的小程序的 appid和路线规划插件routePlan的id，不然无法定位  
5、执行`npm install`安装一些依赖(必须)

## 项目内容
0、基于 [微信小程序签到定位及地图位置选择](https://ext.dcloud.net.cn/plugin?id=1433) 开发  
1、引用了部分[Vant](https://youzan.github.io/vant-weapp)组件，具体见`wxcomponents\vant`  
2、引用了[dayjs](https://github.com/iamkun/dayjs)处理日期格式  
3、引用了部分[lodash](https://lodash.com)的方法  
4、获取位置信息及搜索使用的`微信小程序JavaScript SDK`，详情见文档：[https://lbs.qq.com/qqmap_wx_jssdk/index.html](https://lbs.qq.com/qqmap_wx_jssdk/index.html)

## 其他

uniapp微信小程序中具体使用vant可参考：[https://liubing.me/uniapp-use-vant-weapp.html](https://liubing.me/uniapp-use-vant-weapp.html)

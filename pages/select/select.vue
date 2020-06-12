<template>
  <view class="select-location">
    <map id="map"
      :latitude="latitude"
      :longitude="longitude"
         :markers="scenery"
         :scale="8"
         :show-location="true"
         @callouttap="bindcallouttap"
         @markertap="bindcallouttap"
         :markertap="bindcallouttap"

      @regionchange="changeEvent">
      <!-- 顶部搜索框 -->
      <cover-view class="top-search">
        <van-search :value="keyword"
          background="rgba(255, 255, 255, 0)"
          shape="round"
          readonly
          placeholder="关键词搜索"
          @click.native="goSearch">
        </van-search>
      </cover-view>
      <!-- 定位标志 -->
      <cover-image class="location-icon"
        src="/static/images/location.png">
      </cover-image>
      <!-- tip -->
      <cover-view class="tip">您可以拖动地图，标记当前精准位置</cover-view>
    </map>
    <view class="search-area">
      <view class="search-list">
        <scroll-view class="list"
          scroll-y>
          <view :class="['list-item', 'flex', 'van-hairline--bottom', active === item.id ? 'active' : '']"
            v-for="(item) in list"
            :key="item.id"
            @tap="selectedAddress(item)">
            <van-icon v-if="active === item.id"
              class="icon"
              name="checked"
              size="34rpx"
              :color="active === item.id ? '#007aff' : ''">
            </van-icon>
            <view class="info">
              <view class="title ellipsis">{{ item.title }}</view>
              <view class="address ellipsis">{{ item.address }}</view>
            </view>
          </view>
        </scroll-view>
<!--        <van-button type="primary"-->
<!--          block-->
<!--          @click="handleConfirm">-->
<!--          确认位置-->
<!--        </van-button>-->
      </view>
    </view>
  </view>
</template>

<script>
import debounce from 'lodash/debounce'
import { formatDate, reverseGeocoder, getLocation } from '@/utils'
import { mapGetters, mapMutations } from 'vuex'
export default {
  data () {
    return {
      keyword: '',
      active: '',
      longitude: '',
      latitude: '',
      list: [],
      mapContext: null,
      changeEvent: debounce(this.handleRegionChange, 300),
      scenery: [
        {"id":1,"rank":1,"name":"黄山市黄山风景区","address":"安徽省黄山市黄山区205国道","longitude":118.168089,"latitude":30.13039,"open":"6:00-17:30 ","recommend":"“ 黄山归来不看岳，五岳归来不看山”"},
        {"id":2,"rank":2,"name":"泰安泰山景区","address":"山东省泰安市泰山区红门路","longitude":117.150998,"latitude":36.229895,"open":"全天开放","recommend":"打卡泰山!古人说会当凌绝顶! -览众山小!过来山顶人很多!玩了一天看到辛辛苦苦的大叔肩.上扛着水_上山!也是因为你们泰山更五彩缤纷!去登山个人感觉不光能锻炼人的意志!不到最后不放弃一直前进没有后退可言!我们也是一气就登顶了"},
        {"id":3,"rank":3,"name":"杭州西湖风景区","address":"杭州市西湖区龙井路1号 ","longitude":120.12792,"latitude":30.228932,"open":"全天开放","recommend":"最喜欢晚上去西湖走一走，想要未知的疯狂想要声色的张扬想要在最好的时光在最美地方。"},
        {"id":4,"rank":4,"name":"渭南华阴市华山景区","address":"陕西省渭南市华阴市集灵路中段","longitude":110.073028,"latitude":34.497647,"open":"8:00-15:00","recommend":"西岳果然是名不虚传，华山真的是秀奇险峻，作为道教圣地，跟峨眉山的感觉又不一样了，峨眉山更多的是一种神圣，华山更多的是一种庄重,从西峰可以看到华北平原，还有那棵同样出名的迎客松，样子更加骄傲奇特，日出真的很美啊。"},
        {"id":5,"rank":5,"name":"故宫博物院","address":"北京市东城区景山前街4号 ","longitude":116.403414,"latitude":39.924091,"open":"8:00-17:00","recommend":"故宫是北京最标志性的建筑!就像一幅巨大的布景，每个小角落，都曾演绎着-部部的故事。这里故事的主角，并非只有帝王将相，还有着很多平凡的人们，侍卫，宫女，太监，以及曾进出来往宫人。即使他们绝大多数在历史上并没有留下姓名，但是也抹不掉，挥不去他们曾经存在过的印记。"},
        {"id":6,"rank":6,"name":"武汉黄鹤楼公园","address":"武汉市武昌区蛇山西山坡特1号 ","longitude":114.312194,"latitude":30.549265,"open":"8:30-17:00","recommend":"疫情前光顾的武汉，再登黄鹤楼感受长江东流不复回的画面，爬楼也是够累的，从长江大桥步行至黄鹤楼，院子里转完确实也挺累的，景区厕所是亮点，可视化电视能够看到使用情况和卫生报.告，感叹武汉作为中心城市还是发展快于西安很多的。期待疫情后再次光临武汉，吃热干面，登黄鹤楼"},
        {"id":7,"rank":7,"name":"杭州淳安千岛湖风景区","address":"浙江省杭州市淳安县梦姑路","longitude":119.032092,"latitude":29.593886,"open":"全天开放","recommend":"阴天去千岛湖很合适，景色别有一番风情，雨后空气也很清新"},
        {"id":8,"rank":8,"name":"厦门鼓浪屿风景名胜区","address":"厦门市思明区安海路 ","longitude":118.073467,"latitude":24.450968,"open":"全天开放","recommend":"鼓浪屿，去厦门的必去景点，人虽然多，但是风景优美，美食多种多样，跟朋友一起晚上出来溜达的时候，气候温度刚刚好。"},
        {"id":9,"rank":9,"name":"广州长隆旅游度假区","address":"广州市番禺区汉溪大道东与长隆地铁大道交汇处北侧 ","longitude":113.331839,"latitude":23.005809,"open":"全天开放","recommend":"长隆欢乐世界里面，感觉最惊险刺激的项目只有三个，第一个是垂直过山车，第二个是超级大摆锤，第三个是自由落体跳楼机。这三个项目都是特别大胆特别年轻特别健康的才敢上，所以排队的人比较少，这个自由落体太高了，所以连人都没有，只有三个大胆的人，哈哈哈"},
        {"id":10,"rank":10,"name":"嘉兴桐乡乌镇古镇","address":"浙江省嘉兴市桐乡市石佛南路18号 ","longitude":120.49039,"latitude":30.756424,"open":"8:00-17:00","recommend":"一直想去乌镇逛一逛，听说那里的景色很美气候宜人，每年都会有乌镇戏剧节，感觉是一个充满历史文化的地方。第-次和朋友单独出游就选择了来到这里，住民宿，品茶道，享受慢生活。那里的气候比较湿润，去的时候也赶，上了下小雨，反而更加有浪漫气息。在工作学习忙碌之余，来到这里逛一逛，放松心情，是一个不错的选择。"},
        {"id":11,"rank":11,"name":"长白山景区","address":"二道白河镇 ","longitude":128.081342,"latitude":42.029465,"open":"8:30-17:00","recommend":"长白山风景区也是人生必去景点之一哈~~自然地理环境优美，感觉很远古时代，山很高很伟岸，让人感觉很雄壮，自己很渺小，对山有种由内心发出的敬畏感~.上山路很蜿蜒曲折，大巴师傅技术那叫一个溜~~11月份山顶积雪很高，差不多有一人高，一山有四季，这就是长白山的魅力"},
        {"id":12,"rank":12,"name":"苏州吴中太湖旅游区","address":"江苏省苏州市吴中区旺山路 ","longitude":120.565993,"latitude":31.206742,"open":"8:00-17：30","recommend":"炎炎夏日的午后，乘船登太湖仙岛。享微风拂面，心情极好！"},
        {"id":13,"rank":13,"name":"青岛崂山旅游风景区","address":"山东省青岛市崂山区 ","longitude":120.625651,"latitude":36.19066,"open":"6:00-19:00","recommend":"来青岛必来崂山一游，风景特别好，建议多带一件衣服，海边晚上没太阳了就开始冷了，现在疫情期间道观还没有开门门]不能进去，只能外面走走，风景是非常好，路也走的挺多的，缆车看当天天气情况安排开不开的，所以建议不要先买好票，进去是最大巴的开了还挺远的。"},
        {"id":14,"rank":14,"name":"南平武夷山风景名胜区","address":"南平市武夷山市星村镇","longitude":117.963042,"latitude":27.668108,"open":"8:00-17:00","recommend":"公司团建钟爱爬山，这次去的是武夷山，高铁开通后非常方便，从上海出发三个多小时就到了,可能是下过雨的关系一出站就感觉客气非常潮湿，来的武夷山风景区果然风景非常优美，强烈推荐漂流，一个多小时非常悠闲，每个船夫都是一个段子手。"},
        {"id":15,"rank":15,"name":"九江庐山风景名胜区","address":"江西省九江市庐山市牯岭镇 ","longitude":116.001082,"latitude":29.561544,"open":"全天开放","recommend":"庐山是真的美，以至于我们实验室的师兄开玩笑说这地方真的适合养老。气候宜人，山下面的气温穿个短袖都冒汗。山上面我的天真的是舒服。本来以为山上面肯定也和黄山差不多啥都没有。没想到居然啥都有。就是个繁华的小镇看住的酒店就知道了。。三宝树真的大。锦绣谷，五老峰到处都是景，去的时候还下起了雨，烟雨朦胧别有一番滋味。"},
        {"id":16,"rank":16,"name":"颐和园","address":"北京市海淀区新建宫门路19号 ","longitude":116.278749,"latitude":40.004869,"open":"6:30-18:00","recommend":"在这玩的特别好，和家人一起去的北京颐和园,-路分享美景和快乐，家人都是第- -次来北京,也见识到了颐和园很多不一样的美，在里面兜兜转转半天也不觉得累，下次如果有机会。 还会带家人再次过来，相信北京颐和园会越来越美!"},
        {"id":17,"rank":17,"name":"嘉峪关文物景区","address":"甘肃省嘉峪关市峪泉镇 ","longitude":98.226473,"latitude":39.806466,"open":"8:30-18:00","recommend":"前两年去过，明长城西端第一重关，中国历史上重要的军事要塞，饱经风霜，很有大西北的苍凉之感。如今关城内空空荡荡，当年想必也是充满了无数故事。不过城墙之类的都不太有历史的沧桑感，不知道是不是后来重修过的。"},
        {"id":18,"rank":18,"name":"成都青城山都江堰旅游景区","address":"四川省成都市都江堰市青城山镇青城山路 ","longitude":103.569195,"latitude":30.911742,"open":"8:00-17:00","recommend":"这里的气候非常舒适，一路上开着车听着音乐，穿过斑驳的林荫疏影，叶子绿的发新。空气混合着湿润的味道，水的味道，鱼的味道，还有风的气息...我不知道跨过了多少个桥一路弯弯绕绕随着情绪的节奏，开到了一处浅滩，翻过了些许不高的小石，便是这一处，像是岛屿，波光粼粼,令人喜出望外的。"},
        {"id":19,"rank":19,"name":"嘉兴南湖旅游区","address":"嘉兴市南湖区南溪西路1号 ","longitude":120.76508,"latitude":30.757469,"open":"全天开放","recommend":"红色经典旅游必去之地~特别喜欢红色旅游，有幸来这里有一点点事情需要做，于是和好友一起.过来转转，第一天来的晚了，船停了，第二天起了大早，赶来~很不错~工作人员服务特别赞~可惜中午的高铁，所以没有仔细看看，就去赶高铁了，下次还回来的~"},
        {"id":20,"rank":20,"name":"神农架生态旅游区","address":"湖北省神农架林区209国道 ","longitude":110.576738,"latitude":31.357065,"open":"全天开放","recommend":"晨风揉醒花千朵，银雾含香吻村落。翠湖鳞波连天际，偕同霞女织绫罗。梅子黄时日日晴，小溪泛尽却山行。绿阴不减来时路，添得黄鹂四五声。漠路风尘，朝代依时更迭，江山随情移主;丛花烟火，日月驰骋转换，世事随性变迁。愿我们在每一个清浅的日子里，站在天地之间，笑看红尘多痛快;站在风云之间，快乐随着清风来。"},
        {"id":21,"rank":21,"name":"吉安井冈山风景旅游区","address":"吉安市井冈山市茨坪镇","longitude":114.143789,"latitude":26.636167,"open":"2月16日-11月15日（8:00-17:00）;11月16日-次年2月15日（8:00-16:30）","recommend":"天然氧吧，可以看的地方非常多，井冈山的杜娟花美不胜收"},
        {"id":22,"rank":22,"name":"池州青阳县九华山风景区","address":"池州市青阳县九华镇九华街","longitude":117.830511,"latitude":30.484894,"open":"全年全天开放","recommend":"真的好多古迹，一路景色让人难忘，确实是地藏菩萨的宝地"},
        {"id":23,"rank":23,"name":"金华东阳横店影视城景区","address":"浙江省金华市东阳市横店镇","longitude":120.323376,"latitude":29.143633,"open":"08:30~17:30","recommend":"穿上不同时期的古装多次穿越，过足了戏瘾"},
        {"id":24,"rank":24,"name":"阿勒泰地区布尔津县喀纳斯景区","address":"新疆维吾尔自治区阿勒泰地区布尔津县232省道","longitude":87.138377,"latitude":48.513535,"open":"5月1日-10月15日 08:30-20:30；10月16日-次年4月30日 09:00-19:30","recommend":"湖水的颜色很梦幻，清早去三湾看晨雾，犹如仙境"},
        {"id":25,"rank":25,"name":"三亚市蜈支洲岛旅游区","address":"三亚市海棠区林旺镇后海村","longitude":109.77286,"latitude":18.316394,"open":"8:00-17:30","recommend":"蜈支洲真的是三亚必去景点没有之一，海水真的很清澈"},
        {"id":26,"rank":26,"name":"鹰潭市贵溪龙虎山风景名胜区","address":"鹰潭市贵溪市龙虎山景区排衙石大道","longitude":116.987892,"latitude":28.125406,"open":"7:30-17:10","recommend":"感觉这里的风景非常的优美，山不是太高，非常有特色"},
        {"id":27,"rank":27,"name":"舟山普陀山风景区","address":"舟山市普陀区梅岑路1号","longitude":122.397608,"latitude":30.007976,"open":"8:00-18:00","recommend":"这里寺庙非常多，最有名的还是那座33米高观音大士"},
        {"id":28,"rank":28,"name":"晋中平遥古城景区","address":"山西省晋中市平遥县康宁路","longitude":112.19022,"latitude":37.209535,"open":"4月1日-10月7日 08:00-18:00；10月8日-次年3月31日 08:00-17:30","recommend":"步入古城，信马由缰，青石斑驳，仿佛瞬间穿越回了古代"},
        {"id":29,"rank":29,"name":"镇江三山风景名胜区","address":"江苏省镇江市润州区和平路街道金山路62号（金山风景区）","longitude":119.422035,"latitude":32.219931,"open":"8:30~17:00","recommend":"非常的有特色，漫步其中，心情非常的舒服"},
        {"id":51,"rank":51,"name":"","address":"镇江市京口区东吴路83号（焦山风景区）","longitude":119.493189,"latitude":32.242681,"open":"5月21日-9月30日 09:00-15:30；10月1日-次年5月20日 07:30-17:00","recommend":"雨中游览焦山，真正体会到了烟雨江南，雨后的景色更美丽"},
        {"id":52,"rank":52,"name":"","address":"镇江市京口区东吴路3号（北固山风景区）","longitude":119.463946,"latitude":32.222391,"open":"09:00-16:00","recommend":"横枕大江，石壁嵯峨，有许多有关三国时代吴国传说和遗迹"},
        {"id":30,"rank":30,"name":"十堰丹江口市武当山风景区","address":"十堰市丹江口市太和街道永乐路13号","longitude":111.069986,"latitude":32.467103,"open":"08:00-18:00","recommend":"武当山峰众多，还有三十岩等特色看点，来这里香客也很多"},
        {"id":31,"rank":31,"name":"鞍山市千山景区","address":"辽宁省鞍山市千山区千山东路79号","longitude":123.123516,"latitude":41.024776,"open":"4月1日-10月31日6:00-18:00","recommend":"人不多，风景也好，秀美奇骏，有点黄山的感觉"},
        {"id":32,"rank":32,"name":"安顺黄果树瀑布景区","address":"贵州省镇宁布依族苗族自治县黄果树镇","longitude":105.679142,"latitude":25.985778,"open":"3月1日-11月30日07:00-19:00；12月1日-次年2月28日08:00-18:00","recommend":"举世闻名的大瀑布，值得花一天时间细细游览"},
        {"id":33,"rank":33,"name":"阿坝藏族羌族自治州九寨沟景区","address":"阿坝藏族羌族自治州九寨沟县漳扎镇","longitude":103.911581,"latitude":33.277594,"open":"08:00-17:00","recommend":"九寨归确实是名不虚传，原始自然风景保护的真的好"},
        {"id":34,"rank":34,"name":"丽江玉龙雪山景区","address":"云南省丽江市玉龙纳西族自治县","longitude":100.210479,"latitude":27.140138,"open":"08:00-17:00","recommend":"高原雪山确实是一大挑战，不过通过登玉龙雪山收获很多！"},
        {"id":35,"rank":35,"name":"黄山市黟县皖南古村落西递宏村","address":"黄山市黟县西递镇031县道","longitude":118.00355,"latitude":29.910232,"open":"全年全天开放","recommend":"祠堂，老宅，组成优美的宏村建筑，生态与生活完美结合"},
        {"id":36,"rank":36,"name":"忻州五台山风景名胜区","address":"山西省忻州市五台县台怀镇","longitude":113.595708,"latitude":38.976198,"open":"2020年1月24日暂时停业，详情请以景区公示为准；原开放时间8:00-17:00","recommend":"不愧是云峰胜景，皇家寺庙，金碧辉煌，风景优美"},
        {"id":37,"rank":37,"name":"西安华清宫景区","address":"陕西省西安市临潼区华清路38号","longitude":109.221619,"latitude":34.364034,"open":"09:00-18:00","recommend":"华清宫气势威仪，园中的景色更是将唐代盛世格局呈现出来"},
        {"id":38,"rank":38,"name":"恭王府景区","address":"北京市西城区前海西街17号","longitude":116.392599,"latitude":39.943381,"open":"周二-周日8:30-17:00，全年除法定节假日外周一闭馆","recommend":"府邸建筑庄重肃穆，富丽天然，实为中国园林建筑的典范"},
        {"id":39,"rank":39,"name":"乐山峨嵋山景区","address":"名山南路41号峨眉山(西南门)附近（出入口）","longitude":103.298396,"latitude":29.586092,"open":"1月16日-12月14日 06:00-18:00；12月15日-次年1月15日 07:00-18:00","recommend":"风景很不错，气候也适宜，云雾缭绕，金顶和大佛气势恢宏"},
        {"id":40,"rank":40,"name":"保定安新白洋淀景区","address":"保定市安新县旅游路","longitude":115.956968,"latitude":38.9511,"open":"3月15日-11月15日8:30-17:30;11月16日-次年3月14日景区闭园","recommend":"绿树掩映下的红砖墙，竹林里的古朴书院，另一种安静美"},
        {"id":41,"rank":41,"name":"苏州园林","address":"苏州市姑苏区东北街202号","longitude":120.629226,"latitude":31.324246,"open":"07:30-17:30","recommend":"苏州最大的古典园林代表作品，与北京颐和园、承德避暑山庄、苏州留园一起被誉为中国四大名园。"},
        {"id":42,"rank":42,"name":"拉萨布达拉宫景区","address":"西藏自治区拉萨市城关区北京中路35号","longitude":91.118456,"latitude":29.654468,"open":"09:30-15:00","recommend":"世界上海拔最高、最雄伟的宫殿，是拉萨乃至西藏最重要的象征。"},
        {"id":43,"rank":43,"name":"江西省南昌市滕王阁旅游区","address":"江西省南昌市东湖区仿古街58号","longitude":115.884165,"latitude":28.677433,"open":"08:00-18:30","recommend":"滕王阁临赣江而立，因王勃的《滕王阁序》而闻名，是“江南三大名楼”之一，也是南昌的地标。"},
        {"id":44,"rank":44,"name":"上饶三清山旅游景区","address":"江西省上饶市玉山县三清山管委会外双溪服务区三清山","longitude":118.075915,"latitude":28.907432,"open":"08:30-16:30","recommend":"三清山有“小黄山”之称，以自然山岳风光称绝，以道教人文景观为特色，已开发奇峰48座，怪石52处，景物500余处。"},
        {"id":45,"rank":45,"name":"天津蓟县盘山风景名胜区","address":"天津市蓟县官庄镇莲花岭村","longitude":117.279729,"latitude":40.093249,"open":"07:00-17:00","recommend":"盘山景色以“五峰八石”、“三盘之胜”而奇特称绝，东联九华峰，西傍舞剑峰。五峰攒簇，怪石嶙峋，天然形成了“三盘之胜”。"},
        {"id":46,"rank":46,"name":"贵州省铜仁市梵净山旅游区","address":"贵州省铜仁市江口县杭瑞高速附近太平乡黑湾河梵净山景区","longitude":108.69684,"latitude":27.914366,"open":"08:00-19:00","recommend":"全国著名的弥勒菩萨道场，是中国第五大佛教名山，在佛教史上具有重要的地位。"},
        {"id":47,"rank":47,"name":"张家界武陵源一天门山旅游区","address":"湖南省张家界市永定区天门山","longitude":110.43462,"latitude":29.315184,"open":"08:00-18:00","recommend":"武陵源风景名胜区位于中国中部湖南省西北部，由张家界市的张家界森林公园、慈利县的索溪峪自然保护区和桑植县的天子山自然保护区组合而成，总面积约500平方公里。"},
        {"id":48,"rank":48,"name":"瑞金市共和国摇篮旅游区","address":"赣州市瑞金市沙洲坝金都大道","longitude":116.01241,"latitude":25.88392,"open":"全天","recommend":"由叶坪、红井、二苏大、中华苏维埃纪念园（南园和北园）、中央苏区军事文化博览园等景区组成。"},
        {"id":49,"rank":49,"name":"西安大雁塔-大唐芙蓉园景区","address":"西安市雁塔区芙蓉西路99号","longitude":108.97436,"latitude":34.212717,"open":"10：00-22：00","recommend":"是中国第一个全方位展示盛唐风貌的大型皇家园林式文化主题公园，国家5A级旅游景区"},
        {"id":50,"rank":50,"name":"承德避暑山庄景区","address":"河北省承德市双桥区山庄东路6号","longitude":117.947437,"latitude":40.98233,"open":"07：00-18：00","recommend":"曾是中国清朝皇帝的夏宫，也是现存最大的古典皇家园林，《还珠格格》取景地之一。"},

      ]
    }
  },
  computed: {
    ...mapGetters(['selectedLocation', 'selectedSearch']),
    markers(){
      return this.scenery.map(v=>{
        v.iconPath='../../static/images/location-fill.png'
        v.width = 30
        v.height = 30
        // v.title = v.name
        v.zIndex = 20
        v.markerId = v.id
        v.callout = {
          content: v.name,
          display: 'ALWAYS',
          textAlign: 'center',
          padding: 10,
          borderRadius: 3,
        }
        return v
      })
    }
  },
  onLoad ({ longitude, latitude }) {
    this.mapContext = uni.createMapContext('map')
    wx.cloud.getTempFileURL({
      fileList: [
        'cloud://xlzy-l8jlc.786c-xlzy-l8jlc-1302360965/sceneryMarkers/1.jpg',
        'cloud://xlzy-l8jlc.786c-xlzy-l8jlc-1302360965/sceneryMarkers/2.jpg',
        'cloud://xlzy-l8jlc.786c-xlzy-l8jlc-1302360965/sceneryMarkers/3.jpg',
        'cloud://xlzy-l8jlc.786c-xlzy-l8jlc-1302360965/sceneryMarkers/4.jpg',
        'cloud://xlzy-l8jlc.786c-xlzy-l8jlc-1302360965/sceneryMarkers/5.jpg',
        'cloud://xlzy-l8jlc.786c-xlzy-l8jlc-1302360965/sceneryMarkers/6.jpg',
      ]
    }).then(res => {
      // get temp file URL
      console.log(res.fileList)
    }).catch(error => {
      console.log(error);
      // handle error
    })
    this.getLocation()
  },
  methods: {
    ...mapMutations(['SET_SELECTED_LOCATION', 'SET_SELECTED_SEARCH']),
    bindcallouttap(a,b){
      console.log(a, b);
    },
    goSearch () {
      uni.navigateTo({
        url: `/pages/search/search?longitude=${this.longitude}&latitude=${this.latitude}`
      })
    },
    getLocation () {
      getLocation().then(res => {
          const { longitude, latitude } = res
          this.longitude = longitude
          this.latitude = latitude
          this.getLocationInfo({ longitude, latitude })
        })
        .catch(() => {
          this.location.loading = false
          this.location.error = true
        })
    },

    getLocationInfo (location) {
      reverseGeocoder(location)
        .then(res => {
          let pois = res.result.pois
          if (this.selectedLocation) {
            const index = pois.findIndex(item => item.id === this.selectedLocation.id)
            if (index > -1) pois.splice(index, 1)
            pois.unshift(this.selectedLocation)
          } else if (this.selectedSearch) {
            const index = pois.findIndex(item => item.id === this.selectedSearch.id)
            if (index > -1) pois.splice(index, 1)
            pois.unshift(this.selectedSearch)
          }
          this.list = pois
          if (pois.length) {
            this.active = pois[0].id

          }
        })
    },
    handleRegionChange (e) {
      if (e.type === 'end' && e.causedBy === 'drag') {
        this.SET_SELECTED_LOCATION(null)
        this.SET_SELECTED_SEARCH(null)
        this.mapContext.getCenterLocation({
          success: res => {
            const { longitude, latitude } = res
            this.getLocationInfo({ longitude, latitude })
          }
        })
      }
    },
    selectedAddress (item) {
      this.active = item.id
      this.mapContext.moveToLocation({
        latitude: item.location.lat,
        longitude: item.location.lng
      })
    },
    handleConfirm () {
      const index = this.list.findIndex(item => item.id === this.active)
      if (index > -1) {
        this.SET_SELECTED_LOCATION(this.list[index])
        uni.navigateBack()
      }
    }
  },
  watch: {
    selectedSearch (newData) {
      if (newData) {
        const { lng, lat } = newData.location
        this.mapContext.moveToLocation({
          longitude: lng,
          latitude: lat
        })
        this.getLocationInfo({
          longitude: lng,
          latitude: lat
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.select-location {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  #map {
    width: 100%;
    height: 600rpx;
    position: relative;
  }
  /deep/ .top-search {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    .van-search__content {
      background: $uni-bg-color;
    }
  }
  .location-icon {
    width: 64rpx;
    height: 64rpx;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .tip {
    font-size: 20rpx;
    color: $uni-text-color-grey;
    line-height: 42rpx;
    padding: 0 20rpx;
    position: absolute;
    left: 50%;
    bottom: 30rpx;
    box-shadow: 0px 1px 10px 1px rgba(153, 153, 153, 0.34);
    background-color: $uni-bg-color;
    border-radius: 4px;
    transform: translateX(-50%);
  }
  .search-area {
    width: 100%;
    padding: 0 30rpx;
    box-sizing: border-box;
    position: absolute;
    top: 600rpx;
    bottom: 0;
    .search-list {
      height: 100%;
      background-color: $uni-bg-color;
      border-radius: 4px;
      padding: 20rpx 0;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      .list {
        flex: 1;
        overflow: auto;
        .list-item {
          padding: 15rpx 0;
          position: relative;
          &.active {
            .title,
            .address {
              color: $uni-color-primary;
            }
          }
          .info {
            padding-left: 50rpx;
          }
          .icon {
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
          }
          .title {
            font-size: 28rpx;
            line-height: 40rpx;
          }
          .address {
            font-size: 24rpx;
            height: auto;
            color: $uni-text-color-grey;
          }
        }
      }
    }
  }
}
</style>

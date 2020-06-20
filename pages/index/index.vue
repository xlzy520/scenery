<template>
  <div class="signin">
    <view class="swiper">
      <swiper indicator-dots autoplay indicator-color="#fff" indicator-active-color="#ff001c" >
        <block v-for="img in imgs" :key="img.fileID">
          <swiper-item>
            <image class="swiper-item" :src="img.tempFileURL"></image>
          </swiper-item>
        </block>
      </swiper>
    </view>
    <view class="userinfo">
      <open-data type="userNickName" class="userinfo-nickname"></open-data>
      <open-data type="userAvatarUrl" class="userinfo-avatar"></open-data>
    </view>
    <view class="location">
      <van-cell class="field-cell" title-width="200rpx" title="当前定位">
        <view v-if="location.curLocation.address" class="location">
          {{ location.curLocation.address }}
        </view>
        <view v-if="location.error"
          class="error">
          {{ location.errorInfo }}
        </view>
        <van-loading v-if="location.loading"
          size="26rpx">
          定位中...
        </van-loading>
        <van-button v-if="location.error"
          slot="right-icon"
          type="primary"
          size="mini"
          @click="getLocation">
          重试
        </van-button>
      </van-cell>
    </view>
    <view>
      <view class="weather">
        <van-cell class="field-cell" title-width="600rpx" title="当前天气" :value="weather"></van-cell>
        <van-cell class="field-cell" title-width="600rpx" title="当前气温" :value="temperature+'°'"></van-cell>
        <van-cell-group title="管理" v-if="hasManagePermission">
          <van-cell title="景点标记" is-link link-type="navigateTo" url="/pages/manage/index" />
        </van-cell-group>
      </view>

      <van-divider class="divider" contentPosition="center" dashed>景点推荐</van-divider>
      <scroll-view class="search-list"
                   scroll-y>
        <view class="list-item van-hairline--bottom"
              v-for="(item) in scenery"
              :key="item.id"
              @tap="goToRoutePlan(item)">
          <view class="info">
            <view class="title ellipsis">
              <view>{{ item.title }}</view>
              <view class="distance">{{ item._distance }} m</view>
            </view>
            <view class="address ellipsis">{{ item.address }}</view>
          </view>
        </view>
      </scroll-view>
    </view>
  </div>
</template>

<script>
import { mapSearch, reverseGeocoder, getLocation } from '@/utils'
import { mapGetters, mapMutations } from 'vuex'
import { getWeather } from 'api'
import {MAP_KEY, Default_Location, appName} from "../../config";
export default {
  data () {
    return {
			location: {
				loading: true,
				error: false,
				errorInfo: '定位失败',
				curLocation: null // 当前位置信息
			},
      weather: '',
      temperature: '',
      scenery: [],
      imgs: []
    }
  },
  computed: {
    ...mapGetters(['selectedLocation', 'selectedSearch']),
    hasManagePermission(){
      return true
    }
  },
  onLoad () {
    this.getLocation()
    this.getSwiperImages()
  },
  methods: {
    ...mapMutations(['SET_SELECTED_SEARCH']),
    manageScenery(){
      uni.navigateTo({
        url: `/pages/select/select?longitude=${lng}&latitude=${lat}`
      })
    },
    getWeather(area){
      getWeather({
        location: area
      }).then(res=>{
        const now = res.results[0].now
        this.weather = now.text
        this.temperature = now.temperature
      })
    },
    getSwiperImages(){
      wx.cloud.getTempFileURL({
        fileList: [
          'cloud://wyq-h4cy6.7779-wyq-h4cy6-1302456469/1.jpg',
          'cloud://wyq-h4cy6.7779-wyq-h4cy6-1302456469/2.jpg',
          'cloud://wyq-h4cy6.7779-wyq-h4cy6-1302456469/3.jpg',
          'cloud://wyq-h4cy6.7779-wyq-h4cy6-1302456469/4.jpg',
          'cloud://wyq-h4cy6.7779-wyq-h4cy6-1302456469/5.jpg',
          'cloud://wyq-h4cy6.7779-wyq-h4cy6-1302456469/6.jpg',
        ]
      }).then(res => {
        this.imgs = res.fileList
      }).catch(error => {
        console.log(error);
        // handle error
      })
    },
    // 获取当前定位
    getLocation () {
			this.location.loading = true
			this.location.error = false
      getLocation()
        .then(res => {
					// const { longitude, latitude } = Default_Location
					const { longitude, latitude } = res
					this.getLocationInfo({ longitude, latitude })
          this.getNearbyAttractions(longitude, latitude)
        })
        .catch(() => {
          this.location.loading = false
          this.location.error = true
        })
    },
    // 获取位置信息
    getLocationInfo (location) {
      reverseGeocoder(location)
        .then(res => {
          console.log('当前位置信息：', res)
          const address = res.result.pois[0].title
					this.location.curLocation = res.result
          this.location.error = false
          this.location.loading = false
          const district = res.result.ad_info.district
          this.getWeather(district)
        })
        .catch(err => {
          this.location.loading = false
          this.location.error = true
        })
    },
    // 景区推荐
    getNearbyAttractions(longitude, latitude){
      mapSearch('景区', {
        longitude: longitude,
        latitude: latitude,
      }).then(res=>{
        this.scenery = res.data || []
      })
    },
    goToRoutePlan(item){
      let key = MAP_KEY;  //使用在腾讯位置服务申请的key
      let referer = appName;   //调用插件的app的名称
      let endPoint = JSON.stringify({  //终点
        'name': item.title,
        'latitude': item.location.lat,
        'longitude': item.location.lng
      });
      wx.navigateTo({
        url: 'plugin://routePlan/index?navigation=1&key=' + key + '&referer=' + referer + '&endPoint=' + endPoint
      });
    },

  },
  // watch: {
  //   selectedLocation (newData) {
  //   }
  // }
}
</script>

<style lang="scss" scoped>
.signin {
  /deep/ .field-cell {
    .cell-field {
      .van-cell {
        padding: 0;
      }
    }
    .van-cell__value {
      display: flex;
      align-items: center;
      .location {
        text-align: left;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        flex: 1;
      }
    }
  }
  .signin-area {
    padding-top: 100rpx;
    text-align: center;
    /deep/ .signin-btn {
      .van-button {
        width: 260rpx;
        height: 260rpx;
        box-shadow: 0px 12rpx 30rpx 0px rgba(25, 137, 250, 0.34);
      }
      .label {
        font-size: 30rpx;
        line-height: 42rpx;
        color: $uni-text-color-inverse;
      }
      .time {
        font-size: 40rpx;
        line-height: 56rpx;
      }
    }
    .signin-result {
      color: $uni-text-color-grey;
      font-size: 24rpx;
      line-height: 34rpx;
      margin-top: 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  .swiper-item{
    width: 100%;
  }
  .userinfo {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 750rpx;
  }
  .userinfo-avatar {
    width: 154rpx;
    height: 154rpx;
    border-radius: 50%;
    border: 2px solid #fff;
    background-color: #b90105;
    overflow:hidden;
    display: block;
  }
  .userinfo-nickname {
    font-family: PingFang SC Medium, sans-serif;
    margin: 20rpx 0;
    font-size: 36rpx;
  }
  .scenery{
    .scenery-item{
      display: flex;
    }
  }
  .search-list {
    overflow: auto;
    position: relative;
    flex: 1;
    .list-item {
      padding: 30rpx;
      .title,
      .address {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
      .title {
        display: flex;
        justify-content: space-between;
        font-size: 28rpx;
        line-height: 40rpx;
      }
      .distance{
        color: #ff976a;
      }
      .address {
        font-size: 24rpx;
        height: 34rpx;
        color: $uni-text-color-grey;
      }
    }
  }
  /deep/.van-divider{
    color: #007aff;
  }
}
</style>

<template>
  <div class="signin">
    <view class="swiper">
      <swiper indicator-dots autoplay indicator-color="#fff" indicator-active-color="#ff001c" >
        <block v-for="item in 5" :key="item">
          <swiper-item>
            <image class="swiper-item" :src="'../../static/swiper/'+(item+1)+'.jpg'"></image>
          </swiper-item>
        </block>
      </swiper>
    </view>
    <view class="userinfo">
      <open-data type="userNickName" class="userinfo-nickname"></open-data>
      <open-data type="userAvatarUrl" class="userinfo-avatar"></open-data>
    </view>
    <view class="location">
      <van-cell class="field-cell" required title-width="200rpx" title="当前定位">
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
        <van-button v-if="location.curLocation"
          slot="right-icon"
          type="primary"
          size="mini"
          @click="handleSelect">
          位置微调
        </van-button>
      </van-cell>
    </view>
    <view>
      <view class="weather">
        <van-cell class="field-cell" title-width="600rpx" title="当前天气" :value="weather"></van-cell>
        <van-cell class="field-cell" title-width="600rpx" title="当前气温" :value="temperature+'°'"></van-cell>
      </view>
      <van-divider contentPosition="center" dashed>景点推荐</van-divider>
      <view class="scenery">
        <view class="scenery-item" v-for="item in scenery" :key="item.ID">
          <view>{{item.address}}</view>
          <view>{{item.name}}</view>
          <view>{{item.open}}</view>
          <view>{{item.rank}}</view>
          <view>{{item.recommend}}</view>
        </view>
      </view>
    </view>
  </div>
</template>

<script>
import { formatDate, reverseGeocoder, getLocation } from '@/utils'
import { mapGetters, mapMutations } from 'vuex'
import { getWeather } from 'api'
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
      imgs: [

      ]
    }
  },
  computed: {
    ...mapGetters(['selectedLocation', 'selectedSearch'])
  },
  onLoad () {
    this.getLocation()
  },
  methods: {
    ...mapMutations(['SET_SELECTED_SEARCH']),
    // 签到
    getWeather(area){
      getWeather({
        location: area
      }).then(res=>{
        const now = res.results[0].now
        this.weather = now.text
        this.temperature = now.temperature
      })
    },
    // 获取当前定位
    getLocation () {
			this.location.loading = true
			this.location.error = false
      getLocation()
        .then(res => {
					const { longitude, latitude } = res
					this.getLocationInfo({ longitude, latitude })
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
    // 位置微调
    handleSelect () {
      if (this.location.curLocation) {
        const { lng, lat } = this.location.curLocation.location
        if (this.selectedSearch && (this.selectedSearch.location.lng !== lng || this.selectedSearch.location.lat !== lat)) {
          this.SET_SELECTED_SEARCH(null)
        }
        uni.navigateTo({
					url: `/pages/select/select?longitude=${lng}&latitude=${lat}`
				})
      } else {
        this.getLocation()
      }
    }
  },
  watch: {
    selectedLocation (newData) {
    }
  }
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
}
</style>

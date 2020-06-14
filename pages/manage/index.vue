<template>
  <view class="search">
    <view class="top-search">
      <van-search :value="keyword" shape="round" placeholder="关键词搜索" clearable
        @change="changeSearchValue">
      </van-search>
    </view>
    <scroll-view class="search-list"
      scroll-y>
      <view class="list-item van-hairline--bottom"
        v-for="(item) in showList"
        :key="item.id"
        @tap="handleSelect(item)">
        <view class="info">
          <view class="title ellipsis">{{ item.name }}</view>
          <view class="address ellipsis">{{ item.address }}</view>
        </view>
        <view class="delete" @click="()=>remove(item)">删除</view>
      </view>
      <view v-if="loading"
        class="loading">
        <van-loading size="32rpx">
          <text class="loading-text">加载中...</text>
        </van-loading>
      </view>
      <view v-if="noResult"
        class="no-result">
        暂无数据
      </view>
    </scroll-view>
    <view class="footer">
      <van-button type="primary" block @click="add">新增景区</van-button>
    </view>
  </view>
</template>

<script>
import debounce from 'lodash/debounce'
import { mapMutations } from 'vuex'
import {MAP_KEY} from "../../config";
export default {
  data () {
    return {
      keyword: '',
      loading: false,
      noResult: false,
      list: [],
      showList: []
    }
  },
  onLoad () {
    this.getMarkers()
  },
  computed: {

  },
  methods: {
    ...mapMutations(['SET_SELECTED_LOCATION','SET_SELECTED_SEARCH']),
    getMarkers(){
      this.list = []
      this.noResult = false
      this.loading = true
      wx.cloud.callFunction({
        name: 'getAllMarkers',
        success: res => {
          this.list = res.result.data
          this.showList = res.result.data
          this.loading = false
          if (!this.list.length) {
            this.noResult = true
          }
        },
        fail: err => {
          this.noResult = false
          this.loading = false
        }
      })
    },

    handleChange (e) {
      this.keyword = e.detail
      this.mapSearch()
    },
    handleSelect (item) {
      this.SET_SELECTED_SEARCH(item)
      this.SET_SELECTED_LOCATION(null)
      uni.navigateBack()
    },
    changeSearchValue({detail}){
      this.showList = this.list.filter(
        value => value.address.includes(detail) ||
        value.name.includes(detail))
    },
    add(){
      const key = MAP_KEY; //使用在腾讯位置服务申请的key
      const referer = '景你所见'; //调用插件的app的名称
      const location = JSON.stringify({
        latitude: 39.89631551,
        longitude: 116.323459711
      });
      const category = '生活服务,娱乐休闲';

      // wx.navigateTo({
      //   url: 'plugin://chooseLocation/index?key=' + key + '&referer=' + referer + '&location=' + location + '&category=' + category
      // });
      console.log(location);
    },
    remove(item){

    }
  }
}

</script>

<style lang="scss" scoped>
.search {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .top-search {
    box-shadow: 0px 1px 10px 1px rgba(153, 153, 153, 0.34);
  }
  .search-list {
    overflow: auto;
    position: relative;
    flex: 1;
    margin-bottom: 120rpx;
    .list-item {
      padding: 30rpx;
      display: flex;
      justify-content: space-between;
      .title,
      .address {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
      .title {
        font-size: 28rpx;
        line-height: 40rpx;
      }
      .address {
        font-size: 24rpx;
        height: 34rpx;
        color: $uni-text-color-grey;
      }
      .delete{
        font-size: 28rpx;
        color: #ff001c;
      }
    }
  }
  .loading {
    text-align: center;
    margin-top: 30rpx;
  }
  .no-result {
    width: 100%;
    text-align: center;
    font-size: 24rpx;
    color: $uni-text-color-grey;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .footer{
    position: absolute;
    bottom: 30rpx;
    width: 690rpx;
    padding: 0 30rpx;
  }
}
</style>

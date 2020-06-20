<template>
  <view class="search">
    <view class="top-search">
      <van-search :value="keyword" shape="round" placeholder="关键词搜索" clearable
        @change="changeSearchValue">
      </van-search>
    </view>
    <scroll-view class="search-list" scroll-y>
      <view class="list-item van-hairline--bottom" v-for="item in showList" :key="item._id">
        <view class="info">
          <view class="title ellipsis">{{ item.name }}</view>
          <view class="address ellipsis">{{ item.address }}</view>
        </view>
        <view class="delete" @tap="remove(item)">删除</view>
      </view>
      <view v-if="loading" class="loading">
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
      <van-button type="primary" block @click="chooseLocation">新增景区</van-button>
    </view>
  </view>
</template>

<script>
import { mapMutations } from 'vuex'
const chooseLocation = requirePlugin('chooseLocation');
import {MAP_KEY, appName, Default_Location} from "../../config";
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
  onShow(){
    const location = chooseLocation.getLocation();
    if (location) {
      this.add(location)
    }
    console.log(location);
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
    handleSelect(item) {
      this.SET_SELECTED_SEARCH(item)
      this.SET_SELECTED_LOCATION(null)
      uni.navigateBack()
    },
    changeSearchValue({detail}){
      this.showList = this.list.filter(
        value => value.address.includes(detail) ||
        value.name.includes(detail))
    },
    chooseLocation(){
      const key = MAP_KEY; //使用在腾讯位置服务申请的key
      const referer = appName; //调用插件的app的名称
      const location = JSON.stringify(Default_Location);
      const category = '旅游景点';

      wx.navigateTo({
        url: 'plugin://chooseLocation/index?key=' + key + '&referer=' + referer + '&category=' + category+'&location='+location
      });
      console.log(location);
    },
    remove(item){
      wx.showModal({
        title: '提示',
        content: '确认删除该景点标注吗？',
        success:(res)=> {
          if (res.confirm) {
            const db = wx.cloud.database()
            try {
              db.collection('mapMarkers').doc(item._id).remove({
                success: res => {
                  this.getMarkers()
                  wx.showToast({
                    title: '删除成功',
                  })
                },
                fail: err => {
                  console.log(err);
                  wx.showToast({
                    icon: 'none',
                    title: '删除失败'
                  })
                }
              })
            }catch (e) {
              console.log(e);
            }
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    },
    add(location){
      const db = wx.cloud.database()
      db.collection('mapMarkers').add({
        data: {
          ...location,
          rank: this.list.length + 1
        }
      }).then(res=>{
        this.getMarkers()
        wx.showToast({
          title: '新增成功',
        })
      }).catch(err=>{
        wx.showToast({
          icon: 'none',
          title: '新增失败'
        })
      })
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

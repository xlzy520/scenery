<script>
export default {
  onLaunch () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: "foodre-7gmmi9n04246a8c1",//这个就是环境id
        traceUser: true,
      })
    }
    console.log('App Launch')
  },
  onShow () {
    console.log('App Show')
  },
  onHide () {
    console.log('App Hide')
  }
}
</script>

<style>
@import './styles/index.scss';
/*每个页面公共css */
@import '/wxcomponents/vant/common/index.wxss';
</style>

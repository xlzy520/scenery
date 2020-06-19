import http from '../utils/api'

export const getWeather = (data)=>{
  return http.request({
    url:'https://api.seniverse.com/v3/weather/now.json?key=7ka55qtzvvc4re1y&language=zh-Hans&unit=c',
    method:'GET',
    data,
  })
}

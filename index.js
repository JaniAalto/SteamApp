require('dotenv').config()
const express = require('express')
const app = express()
const axios = require('axios')
const cors = require('cors')

app.use(cors())
app.use(express.static('frontend/dist'))

const apiKey = process.env.APIKEY
const baseUrl = 'https://api.steampowered.com'


app.get('/api/getnews', function (req, res) {
  const appId = req.query.appId
  //console.log("appId", appId)
  const url = `${baseUrl}/ISteamNews/GetNewsForApp/v0002/?appid=${appId}&count=3&maxlength=300&format=json`
  
  axios.get(url)
  .then(response => {
    console.log(response.data)
    res.json(response.data)
  })
  .catch(error => {
    console.log(error.response.status + " " + error.response.statusText)
  })
})

app.get('/api/getachievs', function (req, res) {
  const appId = req.query.appId
  //console.log("appId", appId)
  const url = `${baseUrl}/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?key=${apiKey}&gameid=${appId}`

  axios.get(url)
  .then(response => {
    //console.log(response.data)
    res.json(response.data)
  })
  .catch(error => {
    console.log(error.response.status + " " + error.response.statusText)
    res.status(error.response.status).send({ error: error.response.statusText })
  })
})

app.get('/api/getgameinfo', function (req, res) {
  const appId = req.query.appId
  //console.log("appId", appId)
  const url = `${baseUrl}/ISteamUserStats/GetSchemaForGame/v0002/?key=${apiKey}&appid=${appId}`

  axios.get(url)
  .then(response => {
    //console.log(response.data)
    res.json(response.data)
  })
  .catch(error => {
    console.log(error.response.status + " " + error.response.statusText)
    res.status(error.response.status).send({ error: error.response.statusText })
  })
})

app.get('/api/getapplist', function (req, res) {
  const max_results = req.query.max_results
  const last_appid = req.query.last_appid
  //console.log("max_results", max_results)
  //console.log("last_appid", last_appid)
  const url = `${baseUrl}/IStoreService/GetAppList/v1/?key=${apiKey}&max_results=${max_results}&last_appid=${last_appid}`

  axios.get(url)
  .then(response => {
    //console.log(response.data)
    res.json(response.data)
  })
  .catch(error => {
    console.log(error.response.status + " " + error.response.statusText)
    res.status(error.response.status).send({ error: error.response.statusText })
  })
})


const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
require('dotenv').config()
const express = require('express')
const app = express()
const axios = require('axios')
const cors = require('cors')

app.use(cors())
app.use(express.static('frontend/dist'))

const apiKey = process.env.APIKEY
const baseUrl = 'https://api.steampowered.com'

const errorHandler = (error, req, res, next) => {
  if (error.response) {
    console.error(error.response.status + " " + error.response.statusText)
    res.status(error.response.status).send({ error: error.response.statusText })
  }
  else {
    console.error(error)
    res.status(500).send("Unknown server error")
  }
}


app.get('/api/getapplist', function (req, res, next) {
  const max_results = req.query.max_results
  const last_appid = req.query.last_appid
  //console.log("last_appid", last_appid)
  const url = `${baseUrl}/IStoreService/GetAppList/v1/?key=${apiKey}&max_results=${max_results}&last_appid=${last_appid}`

  axios.get(url)
    .then(response => {
      if (response.data) {
        //console.log(response.data)
        if (response.data.response && response.data.response.apps)
          res.json(response.data.response.apps)
        else
          res.json([])
      }
    })
    .catch(error => next(error))
})

// calls for games that don't have achievements available return a 403 Forbidden
app.get('/api/getachievs', function (req, res, next) {
  const appId = req.query.appid
  const url = `${baseUrl}/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?key=${apiKey}&gameid=${appId}`

  axios.get(url)
    .then(response => {
      if (response.data) {
        //console.log("getachievs", response.data)
        if (response.data.achievementpercentages
          && response.data.achievementpercentages.achievements)
          res.json(response.data.achievementpercentages.achievements)
      }
    })
    .catch(error => next(error))
})

// returns either an object with game info or an empty object
// sometimes the empty object is returned after a long delay
// and multiple calls during that delay can cause the backend to freeze
// setting a timeout or abort signal to the request doesn't work at all except in the frontend
app.get('/api/getgameinfo', function (req, res, next) {
  const appId = req.query.appid
  const url = `${baseUrl}/ISteamUserStats/GetSchemaForGame/v0002/?key=${apiKey}&appid=${appId}`

  function newAbortSignal(timeout) {
    const abortController = new AbortController()
    setTimeout(() => abortController.abort(), timeout)

    return abortController.signal
  }
  let config = { timeout: 3000, signal: newAbortSignal(3000) }

  axios.get(url, config)
    .then(response => {
      if (response.data) {
        //console.log("getgameinfo", response.data)
        if (response.data.game && response.data.game.availableGameStats)
          res.json(response.data.game.availableGameStats)
      }
    })
    .catch(error => next(error))
})

app.get('/api/getnews', function (req, res, next) {
  const appId = req.query.appid
  const count = req.query.count
  const url = `${baseUrl}/ISteamNews/GetNewsForApp/v0002/?appid=${appId}&count=${count}&format=json`

  axios.get(url)
    .then(response => {
      if (response.data) {
        //console.log(response.data)
        if (response.data.appnews && response.data.appnews.newsitems)
          res.json(response.data.appnews.newsitems)
      }
    })
    .catch(error => next(error))
})

app.get('/api/getgamestats', function (req, res, next) {
  const appId = req.query.appid
  const count = req.query.count
  const name = req.query.name[0]
  /*
  let names = req.query.name
  let statString = ""
  let count = 0
  if (typeof names === 'object')
    names = Object.values(names)
  names.forEach(name => {
    statString = statString.concat(`&name[${count}]=${name}`)
    count++
  })
  const url = `${baseUrl}/ISteamUserStats/GetGlobalStatsForGame/v0001/?appid=${appId}&count=${count}${statString}`
  */
  
  const url = `${baseUrl}/ISteamUserStats/GetGlobalStatsForGame/v0001/?appid=${appId}&count=${count}&name[0]=${name}`

  axios.get(url)
    .then(response => {
      if (response.data) {
        //console.log(response.data)
        if (response.data.response && response.data.response.globalstats
          && Object.entries(response.data.response.globalstats)[0]
          && Object.entries(response.data.response.globalstats)[0][1]
          && Object.entries(response.data.response.globalstats)[0][1].total)
          res.json(Object.entries(response.data.response.globalstats)[0][1].total)
        else
          res.json(undefined)
      }
    })
    .catch(error => next(error))
})

app.get('/api/getcurrplayers', function (req, res, next) {
  const appId = req.query.appid
  const url = `${baseUrl}/ISteamUserStats/GetNumberOfCurrentPlayers/v0001/?appid=${appId}`

  axios.get(url)
    .then(response => {
      if (response.data) {
        //console.log("getcurrplayers", response.data)
        if (response.data.response)
          res.json(response.data.response)
      }
    })
    .catch(error => next(error))
})


app.use(errorHandler)

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
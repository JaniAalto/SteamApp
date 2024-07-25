import axios from 'axios'
import { useState } from 'react'
import './App.css'
import SearchForm from './components/SearchForm'
import SearchResults from './components/SearchResults'
import Header from './components/Header'
import Achievements from './components/Achievements'
import Stats from './components/Stats'
import News from './components/News'
import Main from './components/MainTab'


function App() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResult, setSearchResult] = useState([])
  const [percentages, setPercentages] = useState([])
  const [achievements, setAchievements] = useState([])
  const [gameStats, setGameStats] = useState([])
  const [gameTitle, setGameTitle] = useState("")
  const [gameNews, setGameNews] = useState([])
  const [sharkInfo, setSharkInfo] = useState([])

  const [searchMessage, setSearchMessage] = useState("")
  const [mainMessage, setMainMessage] = useState("")
  const [achievementsMessage, setAchievementsMessage] = useState("")
  const [statsMessage, setStatsMessage] = useState("")
  const [newsMessage, setNewsMessage] = useState("")

  const [visibleTab, setVisibleTab] = useState('')
  const [currentAppId, setCurrentAppId] = useState("")
  const [loadingAppId, setLoadingAppId] = useState("")
  const [playerCount, setPlayerCount] = useState("")


  const handleInputChange = (event) => {
    setSearchTerm(event.target.value)
  }

  // to-do: allow searching the beginning of the title or anywhere in the title
  // to-do: add animated loading indicator (?)
  const search = async (event) => {
    event.preventDefault()

    const searchButton = document.getElementById('searchButton')
    searchButton.disabled = true

    setSearchMessage("Searching...")
    const startTime = Date.now();

    let combinedResult = []
    let lastAppId = 0
    let finished = false
    let gamesTotal = 0

    // searches through all possible Steam games in batches of 10000 (max would be 50000)
    // batch size doesn't affect search speed much, 10000 updates UI fairly often and thus looks responsive
    do {
      const response = await axios.get(`/api/getapplist/?max_results=10000&last_appid=${lastAppId}`)
        .catch(error => {
          console.log(error)
        })
      //console.log("response", response)
      if (response.data && response.data.length > 0) {
        gamesTotal = gamesTotal + response.data.length
        const result = response.data.filter((app) => app.name.toLowerCase().startsWith(searchTerm.toLowerCase()))
        //console.log("result", result)

        lastAppId = response.data[response.data.length - 1].appid

        combinedResult = combinedResult.concat(result)
        setSearchMessage(`Searching... found ${combinedResult.length} out of ${gamesTotal} games...`)
      }
      else {
        finished = true
        console.log(`Search completed in ${Math.floor((Date.now() - startTime) / 1000)} seconds`);
      }
    }
    while (!finished)

    setSearchResult(combinedResult)
    setSearchMessage(`Found ${combinedResult.length} games out of ${gamesTotal}`)
    searchButton.disabled = false
  }

  const fetchInformation = (appId, appName) => {
    setSharkInfo([])
    setAchievements([])
    setPlayerCount("")
    setGameStats([])
    setGameNews([])

    fetchSharkInfo(appId)
    fetchAchievements(appId)
    fetchPercentages(appId)
    fetchPlayerCount(appId)

    setCurrentAppId(appId)  // used in fetchNews
    setGameTitle(appName)

    setVisibleTab('main')
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
  }

  const fetchSharkInfo = (appId) => {
    setMainMessage("Loading...")

    axios.get(`/api/getsharkinfo/?appid=${appId}`)
      .then(response => {
        //console.log("getsharkinfo response.data", response.data)
        if (response.data) {
          //setMainMessage("")
          setSharkInfo(response.data)
        }
        if (response.data.length === 0) {
          setMainMessage("No info found")
          console.log("No sharkinfo found")
        }
      })
      .catch(error => {
        console.log(error)
        setSharkInfo([])
        setMainMessage("No info found")
      })
  }

  // also gets stats
  const fetchAchievements = (appId) => {
    setAchievementsMessage("Loading...")
    setStatsMessage("Loading...")
    //console.log("Fetching achievements")

    // used to prevent the timeout from clearing achievements if the user has switched to a different game already
    let loading = true
    setLoadingAppId(appId)

    function newAbortSignal(timeout) {
      const abortController = new AbortController()
      setTimeout(() => abortController.abort(), timeout)

      return abortController.signal
    }
    let config = { timeout: 3000, signal: newAbortSignal(3000) }

    axios.get(`/api/getgameinfo/?appid=${appId}`, config)
      .then(response => {
        loading = false
        setLoadingAppId(0)

        if (!response.data) {
          setAchievements([])
          setAchievementsMessage("No achievements found")
          setGameStats([])
          setStatsMessage("No stats found")
          console.log("No achievements or stats found")
        }
        //console.log("fetchAchievements response.data", response.data)

        if (response.data.achievements) {
          setAchievements(response.data.achievements)
          setAchievementsMessage("")
        }
        else {
          setAchievements([])
          setAchievementsMessage("No achievements found")
          console.log("No achievements found")
        }

        //console.log("Fetching stats")
        if (response.data.stats && response.data.stats.length > 0) {
          setGameStats(response.data.stats)
          setStatsMessage("")
          //console.log("Stats: ", response.data.stats)

          fetchAggregatedStats(appId, response.data.stats)
        }
        else {
          setGameStats([])
          setStatsMessage("No stats found")
          console.log("No stats found")
        }
      })
      .catch(error => {
        console.log(error)
        //console.log("loading", loading)
        //console.log("appId, loadingAppId", appId, ", ", loadingAppId)
        if (appId === loadingAppId && loading) {
          console.log("Timed out")
          setAchievements([])
          setAchievementsMessage("No achievements found")
        }
        setGameStats([])
        setStatsMessage("No stats found")
      })
  }

  const fetchPercentages = (appId) => {
    axios.get(`/api/getachievs/?appid=${appId}`)
      .then(response => {
        //console.log("getachievs response.data", response.data)
        if (response.data) {
          setPercentages(response.data)
        }
      })
      .catch(error => {
        console.log(error)
        setPercentages([])
        setAchievementsMessage("No achievements found")
        console.log("No percentages found")
      })
  }

  const fetchNews = (count) => {
    if (currentAppId) {
      setNewsMessage("Loading...")
      axios.get(`/api/getnews/?appid=${currentAppId}&count=${count}`)
        .then(response => {
          //console.log("fetchNews response.data", response.data)
          if (response.data) {
            setGameNews(response.data)
            setNewsMessage("")
            if (response.data.length === 0)
              setNewsMessage("No news found")
          }
        })
        .catch(error => {
          console.log(error)
          setGameNews([])
          setNewsMessage("No news found")
        })
    }
  }

  const fetchPlayerCount = (appId) => {
    axios.get(`/api/getcurrplayers/?appid=${appId}`)
      .then(response => {
        //console.log("fetchPlayerCount response.data", response.data)
        if (response.data && response.data.player_count || response.data.player_count === 0)
          setPlayerCount(response.data.player_count)
        else
          setPlayerCount("N/A")
      })
      .catch(error => {
        console.log(error)
        setPlayerCount("N/A")
      })
  }

  // gets global aggregated numbers associated with the stats, if available
  const fetchAggregatedStats = (appId, stats) => {
    //console.log("Fetching aggregated stats")
    if (stats) {
      stats.forEach(stat => {
        axios.get(`/api/getgamestats/?appid=${appId}&count=1&name[0]=${stat.name}`)
          .then(response => {
            //console.log("fetchAggregatedStats response.data", response.data)
            if (response.data) {
              const newStat = { ...stat, total: response.data }
              const index = stats.findIndex((stat) => stat.name === newStat.name)
              stats[index] = newStat
              console.log("newStat", newStat)
            }
            setGameStats(stats)
          })
          .catch(error => {
            console.log(error)
          })
      })

      // getting all stats with one call doesn't work since the API returns an error if any of them are not
      // aggregated stats, and it's generally impossible to know beforehand which ones are
      /*
      let statString = ""
      let count = 0
      stats.forEach(stat => {
        statString = statString.concat(`&name[${count}]=${stat.name}`)
        count++
      })
      axios.get(`/api/getgamestats/?appid=${appId}&count=${count}${statString}`)
        .then(response => {
          if (response.data) {
            ...
          }
          setGameStats(stats)
        })*/
    }
  }

  const showMain = () => {
    setVisibleTab('main')
  }

  const showAchievements = () => {
    setVisibleTab('achievements')
  }

  const showStats = () => {
    setVisibleTab('stats')
  }

  const showNews = () => {
    setGameNews([])
    fetchNews(5)
    setVisibleTab('news')
  }

  let tabToShow = (<></>)
  // resetting tab button colours
  if (document.getElementById('mainTab'))
    document.getElementById('mainTab').className = "tabButton"
  if (document.getElementById('achievTab'))
    document.getElementById('achievTab').className = "tabButton"
  if (document.getElementById('statsTab'))
    document.getElementById('statsTab').className = "tabButton"
  if (document.getElementById('newsTab'))
    document.getElementById('newsTab').className = "tabButton"

  if (visibleTab === 'main') {
    document.getElementById('mainTab').className = "tabButtonActive"
    if (sharkInfo.length === 0)
      sharkInfo[0] = ""
    tabToShow = <Main sharkInfo={sharkInfo[0]} playerCount={playerCount} mainMessage={mainMessage} />
  }
  if (visibleTab === 'achievements') {
    document.getElementById('achievTab').className = "tabButtonActive"
    tabToShow = <Achievements gameInfoList={achievements} percList={percentages}
      achievementsMessage={achievementsMessage} />
  }
  if (visibleTab === 'stats') {
    document.getElementById('statsTab').className = "tabButtonActive"
    tabToShow = <Stats statsList={gameStats} statsMessage={statsMessage} />
  }
  if (visibleTab === 'news') {
    document.getElementById('newsTab').className = "tabButtonActive"
    tabToShow = <News newsList={gameNews} fetchNews={fetchNews} newsMessage={newsMessage} />
  }


  return (
    <main>
      <div className='searchView' id='searchView'>
        <SearchForm search={search} searchTerm={searchTerm} handleInputChange={handleInputChange}
          searchMessage={searchMessage} />
        <SearchResults searchResult={searchResult} fetchInformation={fetchInformation} />
      </div>
      <div className='contentView' id='contentView'>
        <Header gameName={gameTitle} appId={currentAppId} showMain={showMain} showNews={showNews}
          showStats={showStats} showAchievements={showAchievements} />
        {tabToShow}
      </div>
    </main>
  )
}


export default App

// to-do: add testing (?)
// to-do: add ability to login and fetch user's Steam account information (?)
// to-do: improve visuals with a library like React Bootstrap
// to-do: add a favourites list the user can save games into or a recent searches list
// to-do: fix props validation in component files
// to-do: add a "show random game" button (?)
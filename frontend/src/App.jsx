/* eslint-disable react/prop-types */
// to-do: fix props validation 

import axios from 'axios'
import { useState } from 'react'
import { Parser } from 'bulletin-board-code'
import './App.css'


const SearchForm = ({ search, searchTerm, handleInputChange, message }) => {
  return (
    <>
      <form className='searchForm' onSubmit={search}>
        <input
          value={searchTerm}
          onChange={handleInputChange}
        />
        <button id='searchButton' type='submit'>search</button>
      </form>
      <p className='searchMsg'><b>{message}</b></p>
    </>
  )
}

const SearchResults = ({ searchResult, fetchInformation }) => {
  let resultList = []

  if (searchResult.length > 0) {
    resultList = searchResult.map((app) => <p key={app.appid} className='searchResult'
      onClick={() => fetchInformation(app.appid, app.name)}> {app.name}</p>)
  }

  if (resultList && resultList.length > 0) {
    return (
      <>
        <h2>Search results:</h2>
        {resultList}
      </>
    )
  }
  return (<></>)
}

// to-do: remove "hidden" column if there are no hidden achievements
// to-do: make better percentage bar
const Achievements = ({ gameName, gameInfoList, percList, showNews, showStats, playerCount }) => {
  //console.log("gameInfoList", gameInfoList)
  //console.log("percList", percList)
  const [sortOrder, setSortOrder] = useState('default')

  if (gameInfoList.length === 0 || percList.length === 0) {
    return (
      <div className='achievementView'>
        <button className='tabButton' onClick={showNews}>NEWS</button>
        <button className='tabButton' onClick={showStats}>STATS</button>
        <h1>{gameName}</h1>
        <p>[Current number of players: {playerCount}]</p>
        <p className='resultMsg'><b>No achievements found</b></p>
      </div>
    )
  }

  // combining information from the two sources
  let renderedList = []
  gameInfoList.forEach(stat => {
    const result = percList.find(({ name }) => name === stat.name)
    if (result) {
      renderedList = renderedList.concat({
        name: stat.name, displayName: stat.displayName,
        description: stat.description, percent: result.percent, icon: stat.icon, hidden: stat.hidden
      })
    }
  })

  if (sortOrder === 'percentDesc') {
    renderedList.sort((a, b) => b.percent - a.percent)
  }
  if (sortOrder === 'percentAsc') {
    renderedList.sort((a, b) => a.percent - b.percent)
  }
  if (sortOrder === 'alphabetical') {
    renderedList.sort((a, b) => {
      const nameA = a.displayName.toUpperCase()
      const nameB = b.displayName.toUpperCase()
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    })
  }

  const createBar = (percent) => {  // simple visualisation for the percentage
    let percentBar = ""
    const multiple = Math.round(percent / 10)
    for (let i = 0; i < multiple; i++)
      percentBar = percentBar.concat("|")
    while (percentBar.length < 10)
      percentBar = percentBar.concat("'")
    return percentBar
  }

  return (
    <div className='achievementView'>
      <div>
        <select className='sortSelect' value={sortOrder} onChange={e => setSortOrder(e.target.value)} >
          <option value='default'>Sort by default order</option>
          <option value='percentDesc'>Sort by percentage (desc)</option>
          <option value='percentAsc'>Sort by percentage (asc)</option>
          <option value='alphabetical'>Sort alphabetically</option>
        </select>
        <button className='tabButton' onClick={showNews}>NEWS</button>
        <button className='tabButton' onClick={showStats}>STATS</button>
        <h1>{gameName}</h1>
        <p>[Current number of players: {playerCount}]</p>
      </div>
      <table><tbody>
        {renderedList.map(stat =>
          <tr key={stat.name}>
            <td><img src={stat.icon} width="64" height="64" /></td>
            <td className='nameColumn'><b>{stat.displayName}</b></td>
            <td>{stat.description ? stat.description : "(No description available)"}</td>
            <td>{stat.hidden ? "hidden" : ""}</td>
            <td className='percColumn'>{createBar(stat.percent)} — {stat.percent.toFixed(1)}%</td>
          </tr>)}
      </tbody></table>
    </div>
  )
}

const Stats = ({ statsList, showAchievements }) => {
  //console.log("statsList", statsList)

  if (statsList.length === 0) {
    return (
      <div>
        <button className='tabButton' onClick={showAchievements}>ACHIEVEMENTS</button>
        <h2>Total aggregate stats by all players (WIP)</h2>
        <p className='resultMsg'><b>No stats found</b></p>
      </div>
    )
  }

  return (
    <div>
      <button className='tabButton' onClick={showAchievements}>ACHIEVEMENTS</button>
      <h2>Total aggregate stats by all players (WIP)</h2>
      {statsList.map(stat => {
        if (stat.total)
          return (
            <div key={stat.name}>
              <p>{stat.displayName}: {stat.total}</p>
            </div>
          )
        else
          return (
            <div key={stat.name}>
              <p><s>{stat.displayName}</s></p>
            </div>
          )
      })}
    </div>
  )
}

// to-do: improve placement of the modal close button or allow closing another way
const News = ({ newsList, gameName, showAchievements, fetchMoreNews }) => {
  //console.log("newsList", newsList)
  const [newsItem, setNewsItem] = useState("")
  const [newsCount, setNewsCount] = useState(5)

  const bbcParser = new Parser()

  if (newsList.length === 0)
    return (
      <div className='newsView'>
        <button className='tabButton' onClick={showAchievements}>ACHIEVEMENTS</button>
        <p className='resultMsg'><b>No news found</b></p>
      </div>
    )

  let dialog = document.querySelector('dialog')  // needs to be done twice...

  const showNewsModal = (item) => {
    setNewsItem(item)
    dialog = document.querySelector('dialog')  // ...for correct functioning
    dialog.showModal()
  }

  const convertDate = (date) => {
    if (date)
      return new Date(date * 1000).toJSON().substring(0, 10).replace("-", "/").replace("-", "/")
    else
      return ""
  }

  const parsePreview = (text, feedType) => {
    if (feedType === 1) {  // indicates a community announcement, which are formatted in BBCode
      text = text.replaceAll("{STEAM_CLAN_IMAGE}", "https://clan.akamai.steamstatic.com/images//")
      text = text.replaceAll("[code]", "").replaceAll("[/code]", "")
      text = bbcParser.toHTML(text)
      text = text.replaceAll("[previewyoutube]", "[").replaceAll("][/previewyoutube]", "]")
      text = text.replace(/\[[^\]]*\]/g, "")
    }
    // stripping HTML formatting and images to get plain text
    const tempDivElement = document.createElement("div")
    tempDivElement.innerHTML = text
    text = tempDivElement.innerText

    if (text.length > 400)
      text = text.substring(0, 400) + "..."

    return text
  }

  // to-do: convert previewyoutube embeds into functional YouTube links
  const parseContent = (text, feedType) => {
    const newsContent = document.getElementById('content')
    if (newsContent) {
      newsContent.innerText = ""

      if (feedType === 1) {  // indicates a community announcement, which are formatted in BBCode
        text = text.replaceAll("{STEAM_CLAN_IMAGE}", "https://clan.akamai.steamstatic.com/images//")
        text = text.replaceAll("[code]", "").replaceAll("[/code]", "")
        text = bbcParser.toHTML(text)
        // the following removes previewyoutube embeds since they don't work in HTML
        text = text.replaceAll("[previewyoutube]", "[").replaceAll("][/previewyoutube]", "]")
        text = text.replace(/\[[^\]]*\]/g, "")
      }
      newsContent.insertAdjacentHTML("beforeend", text)

      const images = newsContent.querySelectorAll('img')
      if (images) {
        images.forEach((image) => {
          image.addEventListener("load", () => {
            const aspectRatio = image.width / image.height
            if (image.width > newsContent.clientWidth) {
              image.width = newsContent.clientWidth
              image.height = newsContent.clientWidth / aspectRatio
              //console.log("resized to", image.width, "x", image.height)
            }
          })
        })
      }
    }
  }

  const loadMoreNews = () => {
    fetchMoreNews(newsCount + 5)
    setNewsCount(newsCount + 5)
  }

  const loadButton = document.getElementById('loadMoreButton')
  if (loadButton && newsCount > newsList.length)  // briefly true on each render
    loadButton.disabled = true
  if (loadButton && newsCount === newsList.length)  // so this re-enables the button until news actually runs out
    loadButton.disabled = false

  return (
    <div className='newsView'>
      <button className='tabButton' onClick={showAchievements}>ACHIEVEMENTS</button>
      <h1>{gameName}</h1>
      <div>
        {newsList.map(item => <div key={item.gid} className='newsItem'
          onClick={() => showNewsModal(item)}>
          <div>{item.feedlabel} — {convertDate(item.date)}</div>
          <hr />
          <p><b>{item.title}</b></p>
          <p>{parsePreview(item.contents, item.feed_type)}</p>
        </div>)}
      </div>
      <button id='loadMoreButton' className='loadMoreButton' onClick={loadMoreNews}>load more</button>

      <dialog className="modal">
        <button className='closeButton' onClick={() => dialog.close()}>close</button>
        <div>{newsItem.feedlabel} — {convertDate(newsItem.date)}</div>
        <hr />
        <p><b>{newsItem.title}</b></p>
        <p id='content'>{parseContent(newsItem.contents, newsItem.feed_type)}</p>
      </dialog>
    </div>
  )
}


// to-do: add a "show random game" button (?)
// to-do: add a "loading" text for the different tabs
// to-do: fix Stats re-rendering
// to-do: move tab buttons, player count and game title to a header
function App() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResult, setSearchResult] = useState([])
  const [percentages, setPercentages] = useState([])
  const [achievements, setAchievements] = useState([])
  const [gameStats, setGameStats] = useState([])
  const [gameTitle, setGameTitle] = useState("")
  const [gameNews, setGameNews] = useState([])
  const [message, setMessage] = useState("")
  const [visibleTab, setVisibleTab] = useState('')
  const [currentAppId, setCurrentAppId] = useState("")
  const [playerCount, setPlayerCount] = useState("")


  const handleInputChange = (event) => {
    setSearchTerm(event.target.value)
  }

  // to-do: search beginning of title or anywhere in the title
  // to-do: add animated loading indicator (?)
  const search = async (event) => {
    event.preventDefault()

    const searchButton = document.getElementById('searchButton')
    searchButton.disabled = true

    setMessage("Searching...")
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
        setMessage(`Searching... found ${combinedResult.length} out of ${gamesTotal} games...`)
      }
      else {
        finished = true
        console.log(`Search completed in ${Math.floor((Date.now() - startTime) / 1000)} seconds`);
      }
    }
    while (!finished)

    setSearchResult(combinedResult)
    setMessage(`Found ${combinedResult.length} games out of ${gamesTotal}`)
    searchButton.disabled = false
  }

  const fetchInformation = (appId, appName) => {
    setAchievements([])
    setPlayerCount("")
    setGameStats([])

    fetchAchievements(appId, appName)
    fetchPlayerCount(appId)

    setCurrentAppId(appId)  // used when switching tabs and fetching their data
    setGameTitle(appName)

    setVisibleTab('achievements')
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
  }

  const fetchAchievements = (appId) => {
    axios.get(`/api/getachievs/?appid=${appId}`)
      .then(response => {
        //console.log("getachievs response.data", response.data)
        if (response.data)
          setPercentages(response.data)
      })
      .catch(error => {
        console.log(error)
        setPercentages([])
      })
    axios.get(`/api/getgameinfo/?appid=${appId}`)
      .then(response => {
        //console.log("getgameinfo response.data", response.data)
        if (response.data && response.data.achievements)
          setAchievements(response.data.achievements)
        else
          setAchievements([])

        if (response.data && response.data.stats)
          setGameStats(response.data.stats)
        else
          setGameStats([])
      })
      .catch(error => {
        console.log(error)
        setAchievements([])
        setGameStats([])
      })
  }

  const fetchNews = () => {
    axios.get(`/api/getnews/?appid=${currentAppId}&count=5`)
      .then(response => {
        //console.log("fetchNews response.data", response.data)
        if (response.data)
          setGameNews(response.data)
      })
      .catch(error => {
        console.log(error)
        setGameNews([])
      })
  }

  const fetchMoreNews = (count) => {
    // there is no "last id" parameter for this endpoint that would allow searching in batches of equal size
    axios.get(`/api/getnews/?appid=${currentAppId}&count=${count}`)
      .then(response => {
        //console.log("fetchMoreNews response.data", response.data)
        if (response.data) {
          setGameNews(response.data)
        }
      })
      .catch(error => {
        console.log(error)
      })
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

  // to-do: get all stats with one call
  const fetchAggregatedStats = () => {
    //console.log("currentAppId", appId)
    let newStats = [...gameStats]
    gameStats.forEach(stat => {
      axios.get(`/api/getgamestats/?appid=${currentAppId}&count=1&name[0]=${stat.name}`)
        .then(response => {
          //console.log("fetchAggregatedStats response.data", response.data)
          if (response.data) {
            const newStat = { ...stat, total: response.data }
            const index = newStats.findIndex((stat) => stat.name === newStat.name)
            newStats[index] = newStat
            console.log("newStat", newStat)
          }
          setGameStats(newStats)  // doesn't update the Stats view DOM for some reason
        })
        .catch(error => {
          console.log(error)
        })
    })
  }

  const showNews = () => {
    setGameNews([])
    fetchNews()
    setVisibleTab('news')
  }

  const showStats = () => {
    fetchAggregatedStats()
    setVisibleTab('stats')
  }

  const showAchievements = () => {
    setVisibleTab('achievements')
  }


  let tabToShow = (<></>)
  if (visibleTab === 'achievements') {
    tabToShow = <Achievements gameName={gameTitle} gameInfoList={achievements} percList={percentages}
      showNews={showNews} showStats={showStats} playerCount={playerCount} />
  }
  if (visibleTab === 'stats') {
    tabToShow = <Stats statsList={gameStats} showAchievements={showAchievements} />
  }
  if (visibleTab === 'news') {
    tabToShow = <News newsList={gameNews} gameName={gameTitle} showAchievements={showAchievements}
      fetchMoreNews={fetchMoreNews} />
  }


  return (
    <>
      <section>
        <div className='searchView'>
          <SearchForm search={search} searchTerm={searchTerm} handleInputChange={handleInputChange}
            message={message} />
          <SearchResults searchResult={searchResult} fetchInformation={fetchInformation} />
        </div>
        <hr />
        {tabToShow}
      </section>
    </>
  )
}


export default App

// to-do: add testing
// to-do: add ability to login and fetch user's Steam account information (?)
// to-do: improve visuals with a library like React Bootstrap
// to-do: add a favourites list the user can save games into or a recent searches list
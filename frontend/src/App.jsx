/* eslint-disable react/prop-types */                                                // to-do: fix prop types
import axios from 'axios'
import { useState } from 'react'
import './App.css'


const SearchForm = ({ search, searchTerm, handleInputChange, message }) => {
  return (
    <>
      <form className='searchForm' onSubmit={search}>
        <input
          value={searchTerm}
          onChange={handleInputChange}
        />
        <button type="submit">search</button>
      </form>
      <p className='searchMsg'><b>{message}</b></p>
    </>
  )
}

// to-do: make only games with achiev data clickable (difficult because data is only searched for after clicking)
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

// to-do: make better percentage bar
const Achievements = ({ gameName, gameInfoList, percList, showNews }) => {
  //console.log("gameInfoList", gameInfoList)
  //console.log("percList", percList)
  const [sortOrder, setSortOrder] = useState('default')

  if (gameInfoList.length === 0 || percList.length === 0) {
    return (<p className='resultMsg'><b>No achievements found</b></p>)
  }

  let renderedList = []  // combining information from the two sources
  gameInfoList.forEach(stat => {
    const result = percList.find(({ name }) => name === stat.name)
    if (result) {
      renderedList = renderedList.concat({
        name: stat.name, displayName: stat.displayName,
        description: stat.description, percent: result.percent, icon: stat.icon
      })
    }
  })

  if (sortOrder === 'percentage') {
    renderedList.sort((a, b) => b.percent - a.percent)
    console.log("sorted by", sortOrder)
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
    console.log("sorted by", sortOrder)
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
    <>
      <div className='achievementView'>
        <div>
          <select className='sortSelect' value={sortOrder} onChange={e => setSortOrder(e.target.value)} >
            <option value='default'>Sort by default order</option>
            <option value='percentage'>Sort by percentage</option>
            <option value='alphabetical'>Sort alphabetically</option>
          </select>
          <h1>{gameName}</h1>
          <button onClick={showNews}>show news</button>
        </div>
        <table><tbody>
          {renderedList.map(stat => <tr key={stat.name}>
            <td><img src={stat.icon} width="64" height="64" /></td>
            <td className='nameColumn'><b>{stat.displayName}</b></td>
            <td>{stat.description ? stat.description : "(No description available)"}</td>
            <td className='percColumn'>{createBar(stat.percent)} — {stat.percent.toFixed(1)}%</td>
          </tr>)}
        </tbody></table>
      </div>
    </>
  )
}

// to-do: improve this view, create pop-outs that let you read the full text of the article
const News = ({ newsList, gameName, showAchievements }) => {
  //console.log("newsList", newsList)
  if (newsList.length === 0) {
    return (<p className='resultMsg'><b>No news found</b></p>)
  }

  return (
    <>
      <div className='newsView'>
        <h1>{gameName}</h1>
        <button onClick={showAchievements}>show achievements</button>
        <div>
          {newsList.map(item => <div key={item.gid} className='newsItem'>
            <div>{item.feedlabel} — {new Date(item.date*1000).toDateString()}</div>
            <hr />
            <p><b>{item.title}</b></p>
            <p>{item.contents}</p>
          </div>)}
        </div>
      </div>
    </>
  )
}


function App() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResult, setSearchResult] = useState([])
  const [percentages, setPercentages] = useState('')
  const [gameInfo, setGameInfo] = useState('')
  const [gameTitle, setGameTitle] = useState("")
  const [gameNews, setGameNews] = useState('')
  const [message, setMessage] = useState("")
  const [visibleTab, setVisibleTab] = useState('')

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value)
  }

  // to-do: search beginning of title / middle of title
  // to-do: add animated loading indicator
  const search = async (event) => {
    event.preventDefault()
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
      if (response.data.response && Object.keys(response.data.response).length > 0) {
        gamesTotal = gamesTotal + response.data.response.apps.length
        const result = response.data.response.apps.filter((app) => app.name.toLowerCase().startsWith(searchTerm.toLowerCase()))
        //console.log("result", result)

        //console.log("last app", response.data.response.apps[response.data.response.apps.length - 1])
        lastAppId = response.data.response.apps[response.data.response.apps.length - 1].appid

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
  }

  const fetchInformation = (appId, appName) => {
    fetchAchievements(appId, appName)
    fetchNews(appId)
  }

  const fetchAchievements = (appId, appName) => {
    axios.get(`/api/getachievs/?appId=${appId}`)
      .then(response => {
        setPercentages(response.data)
        //console.log("setPercentages(response.data)", response.data)
      })
      .catch(error => {
        console.log(error)
      })
    axios.get(`/api/getgameinfo/?appId=${appId}`)
      .then(response => {
        setGameInfo(response.data)
        //console.log("setGameInfo(response.data)", response.data)
      })
      .catch(error => {
        console.log(error)
      })

    setGameTitle(appName)
    setVisibleTab('achievements')
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
  }

  const fetchNews = (appId) => {
    axios.get(`/api/getnews/?appId=${appId}&count=5&maxlength=400`)
      .then(response => {
        setGameNews(response.data)
        //console.log("setGameNews(response.data)", response.data)
      })
      .catch(error => {
        console.log(error)
      })
  }

  const showNews = async () => {
    setVisibleTab('news')
  }

  const showAchievements = async () => {
    setVisibleTab('achievements')
  }

  let percList = []
  if (typeof percentages === 'object') {
    if (percentages.achievementpercentages && percentages.achievementpercentages.achievements) {
      percList = percentages.achievementpercentages.achievements
    }
  }
  let gameInfoList = []
  if (typeof gameInfo === 'object') {
    if (gameInfo.game && gameInfo.game.availableGameStats && gameInfo.game.availableGameStats.achievements) {
      gameInfoList = gameInfo.game.availableGameStats.achievements
    }
  }
  let newsList = []
  if (typeof gameNews === 'object') {
    if (gameNews.appnews && gameNews.appnews.newsitems) {
      newsList = gameNews.appnews.newsitems
    }
  }

  let tabToShow = (<></>)
  if (visibleTab === 'achievements') {
    tabToShow = <Achievements gameName={gameTitle} gameInfoList={gameInfoList} percList={percList}
      showNews={showNews} />
  }
  if (visibleTab === 'news') {
    tabToShow = <News newsList={newsList} gameName={gameTitle} showAchievements={showAchievements} />
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
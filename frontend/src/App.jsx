/* eslint-disable react/prop-types */                                                // to-do: fix prop types
import axios from 'axios'
import { useState } from 'react'
import './App.css'


const SearchForm = ({ search, searchTerm, handleInputChange }) => {
  return (
    <form className='searchForm' onSubmit={search}>
      <input
        value={searchTerm}
        onChange={handleInputChange}
      />
      <button type="submit">search</button>
    </form>
  )
}

// to-do: make only games with achiev data clickable (difficult because data is only searched for after clicking)
const SearchResults = ({ searchResult, fetchAchievements }) => {
  let resultList = []

  if (searchResult.length > 0) {
    resultList = searchResult.map((app) => <p key={app.appid} className='searchResult'
      onClick={() => fetchAchievements(app.appid, app.name)}> {app.name}</p>)
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


const Achievements = ({ gameName, gameInfoList, percList }) => {
  //console.log("gameInfoList", gameInfoList)
  //console.log("percList", percList)
  const [sortOrder, setSortOrder] = useState('default')

  if (!gameInfoList || !percList)
    return (<></>)
  if (gameInfoList.length === 0 || percList.length === 0)
    return (<></>)

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
        </div>
        <table><tbody>
          {renderedList.map(stat => <tr key={stat.name}>
            <td><img src={stat.icon} width="64" height="64" /></td>
            <td className='nameColumn'><b>{stat.displayName}</b></td>
            <td>{stat.description ? stat.description : "(No description available)"}</td>
            <td className='percColumn'>{createBar(stat.percent)} – {stat.percent.toFixed(1)}%</td>
          </tr>)}
        </tbody></table>
      </div>
    </>
  )
}


function App() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResult, setSearchResult] = useState([])
  const [percentages, setPercentages] = useState("")
  const [gameInfo, setGameInfo] = useState("")
  const [gameTitle, setGameTitle] = useState("")
  const [message, setMessage] = useState("")
  const [achievementMsg, setAchievementMsg] = useState("")
  let percList = []
  let gameInfoList = []

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
      const response = await axios.get(`http://localhost:3000/getapplist/?max_results=10000&last_appid=${lastAppId}`)
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

  const fetchAchievements = (appId, appName) => {
    axios.get(`http://localhost:3000/getachievs/?appId=${appId}`)
      .then(response => {
        setPercentages(response.data)
        //console.log("setPercentages(response.data)", response.data)
        setAchievementMsg("")
      })
      .catch(error => {
        console.log(error)
        setAchievementMsg("No achievements found")
      })
    axios.get(`http://localhost:3000/getgameinfo/?appId=${appId}`)
      .then(response => {
        setGameInfo(response.data)
        //console.log("setGameInfo(response.data)", response.data)
      })
      .catch(error => {
        console.log(error)
      })
    setGameTitle(appName)
  }

  if (typeof percentages === 'object') {
    if (percentages.achievementpercentages && percentages.achievementpercentages.achievements) {
      percList = percentages.achievementpercentages.achievements
    }
  }

  if (typeof gameInfo === 'object') {
    if (gameInfo.game && gameInfo.game.availableGameStats && gameInfo.game.availableGameStats.achievements) {
      gameInfoList = gameInfo.game.availableGameStats.achievements
    }
  }


  return (
    <>
      <section>
        <div className='searchView'>
          <SearchForm search={search} searchTerm={searchTerm} handleInputChange={handleInputChange} />
          <p className='searchMsg'><b>{message}</b></p>
          <SearchResults searchResult={searchResult} fetchAchievements={fetchAchievements} />
        </div>
        <hr />
        <Achievements gameName={gameTitle} gameInfoList={gameInfoList} percList={percList} />
        <p className='achievementMsg'><b>{achievementMsg}</b></p>
      </section>
    </>
  )
}


export default App

// to-do: add testing
// to-do: add ability to login and fetch your own Steam information (?)
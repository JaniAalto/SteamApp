/* eslint-disable react/prop-types */
import axios from 'axios'
import { useState } from 'react'
import './App.css'


const SearchResults = ({ resultList }) => {
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
  //console.log("renderedList", renderedList)                          // to-do: option to sort by name/percentage

  const createBar = (percent) => {  // simple visualisation for the percentage
    let percentBar = ""
    const multiple = Math.round(percent / 10)
    for (let i = 0; i <= multiple; i++)
      percentBar = percentBar.concat("|")
    while (percentBar.length <= 10)
      percentBar = percentBar.concat("'")
    //console.log("percentBar", percentBar) 
    return percentBar
  }

  return (
    <>
      <h1>{gameName}</h1>
      <table><tbody>
        {renderedList.map(stat => <tr key={stat.name}>
          <td><img src={stat.icon} width="64" height="64" /></td>
          <td className='nameColumn'><b>{stat.displayName}</b></td>
          <td>{stat.description ? stat.description : "(No description available)"}</td>
          <td className='percColumn'>{createBar(stat.percent)} – {stat.percent.toFixed(1)}%</td>
        </tr>)}
      </tbody></table>
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
  let resultList = []

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value)
  }

  const search = async (event) => {
    event.preventDefault()
    setMessage("Searching...")                                         // to-do: add animated loading indicator

    let combinedResult = []
    let last_appid = 0
    let finished = false

    do {  // searches through all possible Steam games in batches of 10000
      const response = await axios.get(`http://localhost:3000/getapplist/?max_results=10000&last_appid=${last_appid}`)
        .catch(error => {
          console.log(error)
        })
      if (response.data.response && Object.keys(response.data.response).length > 0) {
        //console.log("response", response)
        const result = response.data.response.apps.filter((app) => app.name.toLowerCase().startsWith(searchTerm.toLowerCase()))
        //console.log("result", result)
        // to-do: search beginning of title / middle of title

        //console.log("last app", response.data.response.apps[response.data.response.apps.length - 1])
        last_appid = response.data.response.apps[response.data.response.apps.length - 1].appid
        //console.log("last_appid", last_appid)

        combinedResult = combinedResult.concat(result)
        setMessage(`Searching... found ${combinedResult.length} games...`)
      }
      else {
        finished = true
      }
    }
    while (!finished)

    setSearchResult(combinedResult)
    setMessage(`Found ${combinedResult.length} games`)
    //setMessage("")
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
        //setAchievementMsg("")
      })
      .catch(error => {
        console.log(error)
        //setAchievementMsg("No achievements found")
      })
    setGameTitle(appName)
  }

  if (searchResult.length > 0) {
    resultList = searchResult.map((app) => <p key={app.appid} className='searchResult'
      onClick={() => fetchAchievements(app.appid, app.name)}> {app.name}</p>)
    //console.log("resultList", resultList)
  }

  if (typeof percentages === 'object') {
    if (percentages.achievementpercentages && percentages.achievementpercentages.achievements) {
      percList = percentages.achievementpercentages.achievements
    }
  }

  if (typeof gameInfo === 'object') {
    if (gameInfo.game && gameInfo.game.availableGameStats && gameInfo.game.availableGameStats.achievements) {
      //console.log("gameInfo", gameInfo)
      gameInfoList = gameInfo.game.availableGameStats.achievements
    }
  }

  //console.log("gameInfoList", gameInfoList)
  //console.log("percList", percList)

  return (
    <>
      <form className='searchForm' onSubmit={search}>
        <input
          value={searchTerm}
          onChange={handleInputChange}
        />
        <button type="submit">search</button>
      </form>

      <p><b>{message}</b></p>
      <SearchResults resultList={resultList} />

      <hr />

      <Achievements gameName={gameTitle} gameInfoList={gameInfoList} percList={percList} />
      <p><b>{achievementMsg}</b></p>
    </>
  )
}


export default App
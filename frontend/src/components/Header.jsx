/* eslint-disable react/prop-types */

const Header = ({ gameName, appId, showMain, showNews, showStats, showAchievements }) => {
  if (!gameName) {
    // disable buttons?
    return (
      <div className='header'>
        <button className='tabButton' id="mainTab" onClick={showMain}>MAIN</button>
        <button className='tabButton' id="achievTab" onClick={showAchievements}>ACHIEVEMENTS</button>
        <button className='tabButton' id="statsTab" onClick={showStats}>STATISTICS</button>
        <button className='tabButton' id="newsTab" onClick={showNews}>NEWS</button>
      </div>
    )
  }

  const url = `https://store.steampowered.com/app/${appId}`

  return (
    <div className='header'>
    <button className='tabButton' id="mainTab" onClick={showMain}>MAIN</button>
    <button className='tabButton' id="achievTab" onClick={showAchievements}>ACHIEVEMENTS</button>
    <button className='tabButton' id="statsTab" onClick={showStats}>STATISTICS</button>
    <button className='tabButton' id="newsTab" onClick={showNews}>NEWS</button>
      <h1><a href={url}>{gameName}</a></h1>
    </div>
  )
}

export default Header
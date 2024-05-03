/* eslint-disable react/prop-types */

const Header = ({ gameName, playerCount, showNews, showStats, showAchievements }) => {
  if (!gameName) {
    // disable buttons?
    return (
      <div className='header'>
        <button className='tabButton' onClick={showAchievements}>ACHIEVEMENTS</button>
        <button className='tabButton' onClick={showStats}>STATISTICS</button>
        <button className='tabButton' onClick={showNews}>NEWS</button>
      </div>
    )
  }

  return (
    <div className='header'>
      <button className='tabButton' onClick={showAchievements}>ACHIEVEMENTS</button>
      <button className='tabButton' onClick={showStats}>STATISTICS</button>
      <button className='tabButton' onClick={showNews}>NEWS</button>
      <h1>{gameName}</h1>
      <div>[Current number of players: {playerCount}]</div>
    </div>
  )
}

export default Header
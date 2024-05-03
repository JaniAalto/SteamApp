/* eslint-disable react/prop-types */

const Stats = ({ statsList, statsMessage }) => {
  //console.log("statsList", statsList)

  if (statsList.length === 0) {
    return (
      <div className='statsView'>
        <h2>Total aggregate stats by all players</h2>
        <p className='resultMsg'><b>{statsMessage}</b></p>
      </div>
    )
  }

  // most games don't track any global aggregate values for stats
  const statsWithValues = statsList.map(stat => {
    if (stat.total)
      return (
        <div key={stat.name}>
          <p>{stat.displayName}: {stat.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
        </div>
      )
  })
  const statsWithoutValues = statsList.map(stat => {
    if (!stat.total)
      return (
        <div key={stat.name}>
          <p>{stat.displayName}</p>
        </div>
      )
  })

  return (
    <div className='statsView'>
      <h2>Total aggregate stats by all players:</h2>
      {statsWithValues ? statsWithValues : "-"}
      <br />
      <h2>Stats without available aggregate values:</h2>
      {statsWithoutValues ? statsWithoutValues : "-"}
    </div>
  )
}

export default Stats
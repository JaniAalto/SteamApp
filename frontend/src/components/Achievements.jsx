/* eslint-disable react/prop-types */
import { useState } from 'react'

const Achievements = ({ gameInfoList, percList, achievementsMessage }) => {
  //console.log("gameInfoList", gameInfoList)
  //console.log("percList", percList)
  const [sortOrder, setSortOrder] = useState('default')

  if (gameInfoList.length === 0 || percList.length === 0) {
    return (
      <div className='achievementView'>
        <p className='resultMsg'><b>{achievementsMessage}</b></p>
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
      percentBar = percentBar.concat("█")
    while (percentBar.length < 10)
      percentBar = percentBar.concat("░")
    return percentBar
  }

  let achievementTable = (
    <table><tbody>
      {renderedList.map(stat =>
        <tr key={stat.name}>
          <td><img src={stat.icon} width="64" height="64" /></td>
          <td className='nameColumn'><b>{stat.displayName}</b></td>
          <td>{stat.description ? stat.description : "(No description available)"}</td>
          <td>{stat.hidden ? "hidden" : ""}</td>
          <td className='percColumn'>{createBar(stat.percent)} - {stat.percent.toFixed(1)}%</td>
        </tr>)}
    </tbody></table>
  )
  if (!renderedList.find((element) => element.hidden))
    achievementTable = (
      <table><tbody>
        {renderedList.map(stat =>
          <tr key={stat.name}>
            <td><img src={stat.icon} width="64" height="64" /></td>
            <td className='nameColumn'><b>{stat.displayName}</b></td>
            <td>{stat.description ? stat.description : "(No description available)"}</td>
            <td className='percColumn'>{createBar(stat.percent)} - {stat.percent.toFixed(1)}%</td>
          </tr>)}
      </tbody></table>
    )

  return (
    <div className='achievementView'>
      <select className='sortSelect' value={sortOrder} onChange={e => setSortOrder(e.target.value)} >
        <option value='default'>Sort by default order</option>
        <option value='percentDesc'>Sort by percentage (desc)</option>
        <option value='percentAsc'>Sort by percentage (asc)</option>
        <option value='alphabetical'>Sort alphabetically</option>
      </select>
      <br />
      {achievementTable}
    </div>
  )
}

export default Achievements
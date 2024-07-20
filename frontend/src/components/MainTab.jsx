/* eslint-disable react/prop-types */

const Main = ({ sharkInfo, playerCount, mainMessage }) => {
  //console.log("sharkInfo", sharkInfo)

  if (!sharkInfo) {
    return (
      <div className='mainView'>
        <p><b>{mainMessage}</b></p>
      </div>
    )
  }

  const convertDate = (date) => {
    if (date)
      return new Date(date * 1000).toJSON().substring(0, 10).replace("-", "/").replace("-", "/")
    else
      return "N/A"
  }

  const headerImg = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${sharkInfo.steamAppID}/header.jpg`
  const metaCritic = sharkInfo.metacriticScore === "0" ? "N/A" : sharkInfo.metacriticScore + "%"


  if (sharkInfo.isOnSale === "1") {
    return (
      <div className='mainView'>
        <img src={headerImg} />
        <p><b>Release date:</b> {convertDate(sharkInfo.releaseDate)}</p>
        <p><b>Steam rating:</b> {sharkInfo.steamRatingPercent}% (from {sharkInfo.steamRatingCount} reviews)</p>
        <p><b>MetaCritic score:</b> {metaCritic}</p>
        <p><b>Current players:</b> {playerCount}</p>
        <p><b>Current price:</b> <s>${sharkInfo.normalPrice}</s> ${sharkInfo.salePrice} ({parseInt(sharkInfo.savings)}% off)</p>
      </div>
    )
  }

  return (
    <div className='mainView'>
      <img src={headerImg} />
      <p><b>Release date:</b> {convertDate(sharkInfo.releaseDate)}</p>
      <p><b>Steam rating:</b> {sharkInfo.steamRatingPercent}% (from {sharkInfo.steamRatingCount} reviews)</p>
      <p><b>MetaCritic score:</b> {metaCritic}</p>
      <p><b>Current players:</b> {playerCount}</p>
      <p><b>Current price:</b> ${sharkInfo.salePrice}</p>
    </div>
  )
}

export default Main
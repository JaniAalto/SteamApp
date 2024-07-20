/* eslint-disable react/prop-types */
import { useState } from 'react'
import { Parser } from 'bulletin-board-code'

const News = ({ newsList, fetchNews, newsMessage }) => {
  //console.log("newsList", newsList)
  const [newsItem, setNewsItem] = useState("")
  const [newsCount, setNewsCount] = useState(5)

  const bbcParser = new Parser()

  if (newsList.length === 0)
    return (
      <div className='newsView'>
        <p className='resultMsg'><b>{newsMessage}</b></p>
      </div>
    )

  let dialog = document.querySelector('dialog')

  const showNewsModal = (item) => {
    setNewsItem(item)
    dialog = document.querySelector('dialog')  // needs to be re-assigned for correct functioning
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
    fetchNews(newsCount + 5)
    setNewsCount(newsCount + 5)
  }

  const loadMoreButton = document.getElementById('loadMoreButton')
  if (loadMoreButton && newsCount > newsList.length)  // briefly true on each render
    loadMoreButton.disabled = true
  if (loadMoreButton && newsCount === newsList.length)  // so this re-enables the button until news actually runs out
    loadMoreButton.disabled = false

  // the following lets the user close the news dialog by clicking outside it
  if (dialog) {
    dialog.addEventListener("click", () => {
      dialog.close()
    })
  }
  const article = document.getElementById('article')
  if (article) {
    article.addEventListener('click', (event) => {  // prevents dialog from closing if user clicks inside it
      event.stopPropagation()
    })
  }

  return (
    <div className='newsView'>
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

      <dialog className='modal'>
        <button className='closeButton' onClick={() => dialog.close()}>close</button>
        <div id='article'>
          <div>{newsItem.feedlabel} — {convertDate(newsItem.date)}</div>
          <hr />
          <p><b>{newsItem.title}</b></p>
          <p id='content'>{parseContent(newsItem.contents, newsItem.feed_type)}</p>
        </div>
      </dialog>
    </div>
  )
}

export default News
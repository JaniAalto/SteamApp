/* eslint-disable react/prop-types */

const SearchForm = ({ search, searchTerm, handleInputChange, searchMessage }) => {
  return (
    <>
      <form className='searchForm' onSubmit={search}>
        <input
          id="searchInput"
          name="searchInput"
          value={searchTerm}
          onChange={handleInputChange}
          autoComplete="on"
          type="text"
        />
        <button id='searchButton' type='submit'>search</button>
      </form>
      <p className='searchMsg'><b>{searchMessage}</b></p>
    </>
  )
}

export default SearchForm
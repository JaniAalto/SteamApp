/* eslint-disable react/prop-types */

const SearchForm = ({ search, searchTerm, handleInputChange, searchMessage }) => {
  return (
    <>
      <form className='searchForm' onSubmit={search}>
        <input
          value={searchTerm}
          onChange={handleInputChange}
        />
        <button id='searchButton' type='submit'>search</button>
      </form>
      <p className='searchMsg'><b>{searchMessage}</b></p>
    </>
  )
}

export default SearchForm
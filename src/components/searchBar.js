import TextField from '@mui/material/TextField';
import { useState } from 'react';

/**
 * Search Bar Component with basic state logic
 */
const SearchBar = ({callback}) => {
    const [searchBarValue, setSearchBarValue] = useState("")


    const handleChange = (e) => {
        setSearchBarValue(e.target.value)
        callback(searchBarValue)
    }

    return (  
    <TextField className="search-bar" id="standard-basic" label="Filter Name" variant="standard" value={searchBarValue} onChange={(e) => handleChange(e)}/>
    )
}

export default SearchBar;
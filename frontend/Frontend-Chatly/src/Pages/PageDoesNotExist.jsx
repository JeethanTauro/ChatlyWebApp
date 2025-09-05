import React from 'react'
import {Link} from 'react-router-dom'

function PageDoesNotExist() {
  return (
    <div>
      <h1>Page Does Not Exist</h1>
      <Link to = {"/"}>
        <p>Go back to home</p>
      </Link>
    </div>
  )
}

export default PageDoesNotExist

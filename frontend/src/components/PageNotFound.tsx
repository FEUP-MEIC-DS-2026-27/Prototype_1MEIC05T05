import { Link } from 'react-router-dom'

export default function PageNotFound({ basePath }: { basePath: string }) {
  return (
    <>
      <h5>Page not found</h5>
      <Link to={basePath || '/'}>Back to search</Link>
    </>
  )
}

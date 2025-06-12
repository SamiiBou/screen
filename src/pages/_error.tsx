import { NextPageContext } from 'next'

function Error({ statusCode }: { statusCode?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '15vh' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Ooops&nbsp;!</h1>
      <p style={{ fontSize: '1.25rem' }}>
        {statusCode ? `Une erreur ${statusCode} est survenue.` : "Une erreur s'est produite côté client."}
      </p>
    </div>
  )
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error 
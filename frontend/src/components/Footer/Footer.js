import { Container } from 'react-bootstrap'
import { useTranslation } from '../../hooks/useTranslation'

function Footer () {
  const t = useTranslation()

  return (
    <footer className="border-top mt-5 py-3 text-center text-muted">
      <Container>
        <small>
          {t('createdBy')}: <strong>Lucas Wisgikl</strong>
          {' · '}
          <a
            href="https://www.linkedin.com/in/lucas-wisgikl/"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
          {' · '}
          <a href="mailto:Lucaswisgikl6@gmail.com">
            Lucaswisgikl6@gmail.com
          </a>
        </small>
      </Container>
    </footer>
  )
}

export default Footer

import { appDescription, appTitle, author as appAuthor } from '@/helpers'

type PropsType = {
  title: string
  description?: string
  keywords?: string
  author?: string
}

const PageMeta = ({ title, description = appDescription, keywords, author = appAuthor }: PropsType) => {
  return (
    <>
      <title>{title ? `${title} | ${appTitle}` : appTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
    </>
  )
}
export default PageMeta

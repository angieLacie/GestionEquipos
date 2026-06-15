import Header from '@/views/landing/components/Header'
import Hero from '@/views/landing/components/Hero'
import Features from '@/views/landing/components/Features'
import Demo from '@/views/landing/components/Demo'
import Journey from '@/views/landing/components/Journey'
import NewsLetter from '@/views/landing/components/NewsLetter'
import Faqs from '@/views/landing/components/Faqs'
import Footer from '@/views/landing/components/Footer'
import Contact from '@/views/landing/components/Contact'
import PageMeta from '@/components/PageMeta.tsx'

const Landing = () => {
  return (
    <>
      <PageMeta title={'Landing'} />
      <div className="app-landing">
        <Header />
        <Hero />
        <Features />
        <Demo />
        <Journey />
        <NewsLetter />
        <Faqs />
        <Contact />
        <Footer />
      </div>
    </>
  )
}

export default Landing

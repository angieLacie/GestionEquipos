export type TimelineItem = {
  year: number
  title: string
  description: string
}

export type FAQType = {
  question: string
  answer: string
}

export type FooterLinkType = {
  title: string
  links: {
    label: string
    url?: string
  }[]
}

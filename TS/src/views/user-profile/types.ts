export type UserProfile = {
  name: string
  avatar: string
  role: string
}

export type CommentType = {
  id: number
  comment: string
  user: UserProfile
  time: string
  reply?: CommentType[]
}

export type CarouselType = {
  title: string
  description: string
  image: string
}

export type ContactType = {
  role: string
  name: string
  avatar: string
}

import type { CarouselType, CommentType, ContactType, UserProfile } from '@/views/user-profile/types.ts'

import avatar1 from '@/assets/img/demo/avatars/avatar-g.png'
import avatar2 from '@/assets/img/demo/avatars/avatar-h.png'
import avatar3 from '@/assets/img/demo/avatars/avatar-b.png'
import avatar4 from '@/assets/img/demo/avatars/avatar-c.png'
import avatar5 from '@/assets/img/demo/avatars/avatar-d.png'
import avatar6 from '@/assets/img/demo/avatars/avatar-e.png'
import avatar7 from '@/assets/img/demo/avatars/avatar-f.png'

import project1 from '@/assets/img/profile/project-1.png'
import project4 from '@/assets/img/profile/project-4.png'
import project3 from '@/assets/img/profile/project-3.png'

export const comments: CommentType[] = [
  {
    id: 1,
    comment: 'Job well done!',
    user: {
      name: 'Iftekhar Ahmed',
      avatar: avatar1,
      role: 'Marketing Professional',
    },
    time: '1 week ago',
    reply: [
      {
        id: 2,
        comment: 'This is a really great project, loved it also!',
        user: {
          name: 'SAFAYET DOZZA',
          avatar: avatar2,
          role: 'Merchandising Strategist ',
        },
        time: '1 week ago',
      },
    ],
  },
]

export const profileVisitors: UserProfile[] = [
  {
    name: 'Emily Chen',
    avatar: avatar4,
    role: 'Senior UX Designer',
  },
  {
    name: 'Michael Smith',
    avatar: avatar3,
    role: 'Tech Lead at Google',
  },
  {
    name: 'Lisa Wong',
    avatar: avatar5,
    role: 'Product Manager',
  },
]

export const suggestedUsers: UserProfile[] = [
  {
    name: 'David Kim',
    avatar: avatar6,
    role: 'Frontend Developer at Meta',
  },
  {
    name: 'Rachel Green',
    avatar: avatar7,
    role: 'UI Designer at Apple',
  },
  {
    name: 'Tom Wilson',
    avatar: avatar1,
    role: 'Backend Developer at Amazon',
  },
]

export const carouselItems: CarouselType[] = [
  {
    title: 'E-Commerce Platform',
    description: 'A modern shopping experience built with React and Node.js',
    image: project3,
  },
  {
    title: 'Task Management App',
    description: 'Streamline your workflow with our intuitive task manager',
    image: project1,
  },
  {
    title: 'Social Media Dashboard',
    description: 'Analytics and management tools for social media professionals',
    image: project4,
  },
]

export const contacts: ContactType[] = [
  {
    name: 'Sarah Johnson',
    role: 'Senior UX Designer at Adobe',
    avatar: avatar5,
  },
  {
    name: 'Michael Smith',
    role: 'Tech Lead at Google',
    avatar: avatar6,
  },
  {
    name: 'Emily Chen',
    role: 'Product Manager at Microsoft',
    avatar: avatar7,
  },
]

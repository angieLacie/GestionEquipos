import type { ChildrenType } from '@/types'
import SimpleBar, { type Props } from 'simplebar-react'

type SimplebarClientProps = ChildrenType & Props

const SimplebarClient = ({ children, ...restProps }: SimplebarClientProps) => {
  return <SimpleBar {...restProps}> {children}</SimpleBar>
}

export default SimplebarClient

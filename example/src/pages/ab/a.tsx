import { Link, Page, Text } from '@vercel/examples-ui'
import type { NextPage } from 'next'

const MiddlewarePage: NextPage = () => (
  <Page>
    <Text>
      Middleware redirected you to variant:{' '}
      <span className="font-bold text-xl">A</span>
    </Text>
    <div className="pt-8">
      <Link href="/">Go back</Link>
    </div>
  </Page>
)

export default MiddlewarePage

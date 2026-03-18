import { Grid } from 'antd'

export default function useIsMobile() {
  const screens = Grid.useBreakpoint()
  return !screens.md
}
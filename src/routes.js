import React from 'react'
import { Icon } from 'react-native-elements'
import Alarm from './scenes/Alarm'
import Video from './scenes/Video'
import Settings from './scenes/Settings'
import About from './scenes/About'

const routes = {
  alarm: {
    initialRoute: true,
    title: 'Alarm',
    iconProps: {
      name: 'alarm',
    },
    Component: Alarm,
  },
  settings: {
    initialRoute: false,
    title: 'Settings',
    iconProps: {
      name: 'settings',
    },
    Component: Settings,
  },
}

const routeKeys = Object.keys(routes)

export default routes
export { routeKeys }

import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'i4ddie4h',
    dataset: 'production'
  },
  studioHost: 'tim-marrs',
  deployment: {
    appId: 'bem4hmhsym9zqvfkrydqvu6a',
    autoUpdates: true,
  }
})

import { useNav } from './lib/nav'
import { Home } from './screens/Home'
import { ProblemList } from './screens/ProblemList'
import { ModeHub } from './screens/ModeHub'
import { ModeRunner } from './screens/ModeRunner'
import { Session } from './screens/Session'

function App() {
  const nav = useNav()
  const screen = nav.stack[nav.stack.length - 1]
  switch (screen.name) {
    case 'home':
      return <Home />
    case 'problems':
      return <ProblemList />
    case 'hub':
      return <ModeHub problemId={screen.problemId} />
    case 'mode':
      return <ModeRunner problemId={screen.problemId} mode={screen.mode} />
    case 'session':
      return <Session />
  }
}

export default App

// Root Application Component
// Architecture: Smart components live in src/features/ — this is the routing shell
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Placeholder screens — will be replaced in Epic 2+
const HomePage = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="card p-8 text-center max-w-md w-full mx-4">
      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-white text-2xl font-bold">A</span>
      </div>
      <h1 className="text-2xl font-bold text-accent-dark mb-2">Apex IELTS</h1>
      <p className="text-gray-500 mb-6">AI-powered IELTS Learning Platform</p>
      <div className="flex gap-2 justify-center">
        <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
          ✓ Backend Connected
        </span>
        <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
          ✓ Vite + React + TS
        </span>
      </div>
    </div>
  </div>
)

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* Auth routes — Epic 1, Story 1.3 */}
        {/* Exam routes — Epic 2 */}
        {/* Speaking routes — Epic 3 */}
        {/* Booking routes — Epic 4 */}
      </Routes>
    </BrowserRouter>
  )
}

export default App

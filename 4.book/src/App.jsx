import React from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'

export default function App(){
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1">
        <Home />
      </div>
      <footer className="bg-white py-6 text-center text-sm text-gray-600">
        © {new Date().getFullYear()} SS — Built with ❤️
      </footer>
    </div>
  )
}

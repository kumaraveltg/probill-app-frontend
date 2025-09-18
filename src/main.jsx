import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ReactDom from 'react-dom/client'
import ErrorBoundary from '../components/ErrorBoundary.jsx'
import { DataProvider } from '../context/DataContext.jsx'


createRoot(document.getElementById('root')).render(
  
   <ErrorBoundary>
      <DataProvider>
      <App />
      </DataProvider>
   </ErrorBoundary>
  
)

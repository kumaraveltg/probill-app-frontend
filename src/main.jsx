import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ReactDom from 'react-dom/client'
import ErrorBoundary from '../components/ErrorBoundary.jsx'
import { DataProvider } from '../context/DataContext.jsx'
import { AuthProvider } from '../context/AuthContext.jsx' 


createRoot(document.getElementById('root')).render(
  
   <ErrorBoundary>
      <AuthProvider>
         <DataProvider>
         <App />
       </DataProvider>
      </AuthProvider>
   </ErrorBoundary>
  
)

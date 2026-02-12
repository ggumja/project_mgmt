import * as React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { CategoryProvider } from './contexts/CategoryContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <CategoryProvider>
            <App />
        </CategoryProvider>
    </React.StrictMode>,
)

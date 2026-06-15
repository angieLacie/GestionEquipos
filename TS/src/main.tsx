import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

import 'node-waves/dist/waves.css'
import '@/assets/webfonts/smartadmin/scss/sa-icons.scss'
import '@/assets/sass/smartapp.scss'
import '@/assets/sass/nova-overrides.scss'
import { BrowserRouter } from 'react-router'
import AppWrapper from '@/components/AppWrapper.tsx'
import { basePath } from '@/helpers'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basePath}>
      <AppWrapper>
        <App />
      </AppWrapper>
    </BrowserRouter>
  </StrictMode>,
)

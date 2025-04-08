import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <a href="https://coreui.io" target="_blank" rel="noopener noreferrer">
          Simon
        </a>
        <span className="ms-1">2025</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Powered by</span>
        <a href="https://quantumtech.et" target="_blank" rel="noopener noreferrer">
          QuantumTech
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)

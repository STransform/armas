import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4 bg-dark text-white ">
      
      <div className="w-100 d-flex justify-content-center">
        <span className="me-1 ">Developed by</span>
        <a href="https://quantumtech.et" target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff' }}>
          QuantumTech
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)

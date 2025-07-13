// src/lib/hooks/useGTM.ts
'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { gtmEvent } from '@/components/analytics/GoogleTagManager'

export function useGTM() {
  const pathname = usePathname()

  // Track page views automatically
  useEffect(() => {
    const pageName = pathname === '/' ? 'Home' : pathname.replace('/', '').replace('-', ' ')
    
    // Send page view event
    gtmEvent('page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: pathname,
      page_name: pageName
    })
  }, [pathname])

  return {
    // Generic event tracking
    trackEvent: gtmEvent,
    
    // Helper for common events
    trackClick: (elementName: string, additional?: Record<string, any>) => {
      gtmEvent('click', {
        event_category: 'UI',
        event_label: elementName,
        ...additional
      })
    },
    
    trackFormSubmit: (formName: string, additional?: Record<string, any>) => {
      gtmEvent('form_submit', {
        event_category: 'Form',
        event_label: formName,
        ...additional
      })
    },
    
    trackError: (errorMessage: string, errorType?: string) => {
      gtmEvent('exception', {
        description: errorMessage,
        fatal: false,
        error_type: errorType || 'javascript_error'
      })
    }
  }
}
"use client"

import React, { createContext, useContext, useState } from "react"
import type { DateRange } from "react-day-picker"

interface GlobalDateRangeContextValue {
  date: DateRange | undefined
  setDate: (date: DateRange | undefined) => void
}

const GlobalDateRangeContext = createContext<GlobalDateRangeContextValue | undefined>(undefined)

export const GlobalDateRangeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [date, setDate] = useState<DateRange | undefined>(undefined)

  return (
    <GlobalDateRangeContext.Provider value={{ date, setDate }}>
      {children}
    </GlobalDateRangeContext.Provider>
  )
}

export const useGlobalDateRange = () => {
  const context = useContext(GlobalDateRangeContext)
  if (!context) {
    throw new Error("useGlobalDateRange must be used within a GlobalDateRangeProvider")
  }
  return context
}

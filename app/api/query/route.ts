import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { parse, isValid, isWithinInterval } from 'date-fns'

// Unified query API - handles charts, maps, aggregations, and filtered queries
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { datasourceId, type = 'chart', ...params } = body

    if (!datasourceId) {
      return NextResponse.json({ error: 'Missing datasourceId' }, { status: 400 })
    }

    const supabase = createSupabaseAdminClient()
    const { data: ds, error } = await supabase
      .from('datasources')
      .select('processed_data, date_format')
      .eq('id', datasourceId)
      .single()

    if (error || !ds?.processed_data) {
      return NextResponse.json({ error: 'Datasource not found' }, { status: 404 })
    }

    const dateFormat = ds.date_format || 'yyyy-MM-dd'
    let data = applyFilters(ds.processed_data, params.filters, dateFormat)

    let result: any
    switch (type) {
      case 'aggregate':
        result = performAggregation(data, params.column, params.aggregation)
        break
      case 'map':
        result = data // Map component handles its own processing
        break
      case 'chart':
      default:
        result = groupAndAggregate(data, params.categoryKey, params.valueKey)
    }

    return NextResponse.json({ data: result })
  } catch (err) {
    console.error('Query API Error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

function applyFilters(data: any[], filters: any, dateFormat: string) {
  if (!filters?.dateRange?.from || !filters?.dateRange?.to || !filters?.dateColumn) return data
  
  const from = new Date(filters.dateRange.from)
  const to = new Date(filters.dateRange.to)
  
  return data.filter(row => {
    const rowDate = parse(row[filters.dateColumn], dateFormat, new Date())
    return isValid(rowDate) && isWithinInterval(rowDate, { start: from, end: to })
  })
}

function groupAndAggregate(data: any[], categoryKey: string, valueKey: string) {
  if (!categoryKey || !valueKey) return data
  
  const grouped = data.reduce((acc, row) => {
    const key = row[categoryKey]
    const val = parseFloat(row[valueKey]) || 0
    acc[key] = (acc[key] || 0) + val
    return acc
  }, {} as Record<string, number>)

  return Object.entries(grouped).map(([k, v]) => ({ [categoryKey]: k, [valueKey]: v }))
}

function performAggregation(data: any[], column: string, type: string) {
  const values = data.map(r => parseFloat(r[column])).filter(n => !isNaN(n))
  switch (type) {
    case 'sum': return values.reduce((a, b) => a + b, 0)
    case 'count': return data.length
    case 'average': return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0
    case 'min': return Math.min(...values)
    case 'max': return Math.max(...values)
    default: return 0
  }
}
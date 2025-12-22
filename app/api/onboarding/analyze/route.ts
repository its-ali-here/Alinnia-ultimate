import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { generateText } from 'ai'
import { groq } from '@ai-sdk/groq'

export async function POST(request: NextRequest) {
  try {
    console.log('[ONBOARDING_ANALYZE] Starting analysis')

    // Get user from session
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
        },
      }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log('[ONBOARDING_ANALYZE] No user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { industry, niche, goals, uploadedFiles, organizationId } = await request.json()

    console.log('[ONBOARDING_ANALYZE] Analyzing for:', {
      industry,
      niche,
      goals: goals?.length,
      uploadedFiles: uploadedFiles?.length,
      organizationId
    })

    // If no uploaded files, generate recommendations based on industry and goals only
    if (!uploadedFiles || uploadedFiles.length === 0) {
      console.log('[ONBOARDING_ANALYZE] No uploaded files, generating basic recommendations')

      const recommendations = generateBasicRecommendations(industry, niche, goals)
      return NextResponse.json({
        dashboards: recommendations.dashboards,
        insights: recommendations.insights
      })
    }

    // Analyze uploaded data to generate intelligent recommendations
    console.log('[ONBOARDING_ANALYZE] Analyzing uploaded files')

    // Get sample data from uploaded files to analyze
    const supabaseAdmin = createSupabaseAdminClient()
    const fileAnalyses: any[] = []

    for (const file of uploadedFiles) {
      try {
        // Get file data from database
        const { data: fileData, error: fileError } = await supabaseAdmin
          .from('datasources')
          .select('id, file_name, row_count, columns')
          .eq('id', file.id)
          .single()

        if (fileError) {
          console.error(`[ONBOARDING_ANALYZE] Error fetching file ${file.id}:`, fileError)
          continue
        }

        // Get sample rows from the file
        const { data: sampleRows, error: sampleError } = await supabaseAdmin
          .from('datasource_rows')
          .select('data')
          .eq('datasource_id', file.id)
          .limit(10)

        if (sampleError) {
          console.error(`[ONBOARDING_ANALYZE] Error fetching sample rows for ${file.id}:`, sampleError)
          continue
        }

        fileAnalyses.push({
          fileName: fileData.file_name,
          rowCount: fileData.row_count,
          columns: fileData.columns,
          sampleData: sampleRows?.map((row: any) => row.data) || []
        })

      } catch (error) {
        console.error(`[ONBOARDING_ANALYZE] Error analyzing file ${file.id}:`, error)
      }
    }

    // Use AI to analyze the data and generate recommendations
    const analysisPrompt = `You are an expert business analyst helping a ${niche} business in the ${industry} industry.

Business Goals: ${goals?.join(', ') || 'Not specified'}

Uploaded Data Files: ${fileAnalyses.map(f => `${f.fileName} (${f.rowCount} rows, columns: ${f.columns?.join(', ')})`).join(', ')}

Sample Data Structure:
${fileAnalyses.map(f => `
File: ${f.fileName}
Columns: ${f.columns?.join(', ')}
Sample Rows: ${f.sampleData.slice(0, 3).map(row => JSON.stringify(row)).join('\n')}
`).join('\n')}

Based on this business type, goals, and uploaded data, recommend the most relevant dashboards and KPIs. Consider:

1. Industry-specific metrics for ${industry}/${niche} businesses
2. Data-driven insights from the uploaded files
3. Goal alignment with ${goals?.join(' and ') || 'general business success'}
4. Practical KPIs that can be calculated from available data

Return a JSON object with:
{
  "dashboards": [
    {
      "id": "unique_id",
      "name": "Dashboard Name",
      "description": "What this dashboard tracks",
      "recommended": true/false,
      "kpis": ["KPI 1", "KPI 2", "KPI 3"]
    }
  ],
  "insights": "Overall analysis and recommendations"
}`

    console.log('[ONBOARDING_ANALYZE] Sending to AI for analysis')

    const result = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: "You are a business intelligence expert. Analyze the provided data and generate actionable dashboard recommendations.",
      prompt: analysisPrompt,
      temperature: 0.7,
    })

    console.log('[ONBOARDING_ANALYZE] AI response received')

    try {
      // Parse the AI response as JSON
      const aiResponse = JSON.parse(result.text || '{}')

      if (aiResponse.dashboards && Array.isArray(aiResponse.dashboards)) {
        // Ensure all dashboards have required fields
        const validatedDashboards = aiResponse.dashboards.map((dashboard: any, index: number) => ({
          id: dashboard.id || `dashboard_${index}`,
          name: dashboard.name || `Dashboard ${index + 1}`,
          description: dashboard.description || 'Business analytics dashboard',
          recommended: dashboard.recommended !== false, // Default to recommended
          kpis: dashboard.kpis || []
        }))

        return NextResponse.json({
          dashboards: validatedDashboards,
          insights: aiResponse.insights || `Based on your ${niche} business data and goals, we've generated personalized dashboard recommendations.`
        })
      }
    } catch (parseError) {
      console.error('[ONBOARDING_ANALYZE] Error parsing AI response:', parseError)
    }

    // Fallback to basic recommendations if AI analysis fails
    console.log('[ONBOARDING_ANALYZE] Falling back to basic recommendations')
    const recommendations = generateBasicRecommendations(industry, niche, goals)

    return NextResponse.json({
      dashboards: recommendations.dashboards,
      insights: recommendations.insights
    })

  } catch (error) {
    console.error('[ONBOARDING_ANALYZE] Error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze data' },
      { status: 500 }
    )
  }
}

// Helper function to generate basic recommendations when no data is available
function generateBasicRecommendations(industry: string, niche: string, goals: string[]) {
  const recommendations = {
    dashboards: [
      {
        id: "sales",
        name: "Sales Performance",
        description: "Track revenue, conversions, and sales trends",
        recommended: goals.includes("increase_sales"),
        kpis: ["Total Revenue", "Conversion Rate", "Average Order Value"]
      },
      {
        id: "financial",
        name: "Financial Overview",
        description: "Monitor profit margins, expenses, and cash flow",
        recommended: goals.includes("improve_profit"),
        kpis: ["Gross Profit Margin", "Operating Expenses", "Cash Flow"]
      },
      {
        id: "operations",
        name: "Operations Dashboard",
        description: "Optimize processes and track efficiency metrics",
        recommended: goals.includes("operational_efficiency"),
        kpis: ["Process Efficiency", "Resource Utilization", "Time to Completion"]
      },
      {
        id: "customer",
        name: "Customer Analytics",
        description: "Analyze customer satisfaction and retention",
        recommended: goals.includes("customer_satisfaction"),
        kpis: ["Customer Satisfaction Score", "Retention Rate", "Net Promoter Score"]
      },
      {
        id: "team",
        name: "Team Performance",
        description: "Monitor employee productivity and performance",
        recommended: goals.includes("team_productivity"),
        kpis: ["Employee Productivity", "Task Completion Rate", "Performance Metrics"]
      }
    ].filter(d => d.recommended || Math.random() > 0.5),
    insights: `Based on your ${niche} business in the ${industry} industry and your goals of ${goals.slice(0, 2).join(" and ")}, we've selected the most relevant dashboards to help you succeed.`
  }

  return recommendations
}

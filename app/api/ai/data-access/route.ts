import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { query, dataType, organizationId } = await request.json();

    console.log("[AI_DATA_ACCESS] Request:", { query, dataType, organizationId });

    const supabase = createSupabaseAdminClient();

    // Get a sample organization ID for demo purposes
    // In production, you'd get this from the authenticated user's session
    let actualOrgId = organizationId;

    if (organizationId === 'current') {
      // Get the first organization for demo purposes
      const { data: orgs } = await supabase
        .from('organizations')
        .select('id')
        .limit(1);

      actualOrgId = orgs?.[0]?.id || 'demo-org';
    }

    let data = null;
    let summary = "";

    switch (dataType) {
      case 'financial_summary':
        data = await getFinancialSummary(supabase, actualOrgId);
        summary = generateFinancialSummary(data);
        break;

      case 'recent_transactions':
        data = await getRecentTransactions(supabase, actualOrgId);
        summary = generateTransactionsSummary(data);
        break;

      case 'dashboard_metrics':
        data = await getDashboardMetrics(supabase, actualOrgId);
        summary = generateMetricsSummary(data);
        break;

      case 'cash_flow':
        data = await getCashFlowData(supabase, actualOrgId);
        summary = generateCashFlowSummary(data);
        break;
        
      default:
        return NextResponse.json({ error: "Invalid data type" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data,
      summary,
      dataType,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("[AI_DATA_ACCESS] Error:", error);
    return NextResponse.json(
      { error: "Failed to access data", details: error.message },
      { status: 500 }
    );
  }
}

// Helper functions to fetch different types of data
async function getFinancialSummary(supabase: any, organizationId: string) {
  // Get datasources with their processed data
  const { data: datasources } = await supabase
    .from('datasources')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(5);

  // Get organization info
  const { data: org } = await supabase
    .from('organizations')
    .select('name, industry, created_at')
    .eq('id', organizationId)
    .single();

  // Analyze the actual data from files
  let totalSales = 0;
  let totalRevenue = 0;
  let transactionCount = 0;
  let dataInsights = [];

  if (datasources && datasources.length > 0) {
    for (const datasource of datasources) {
      if (datasource.processed_data && Array.isArray(datasource.processed_data)) {
        const analysis = analyzeDataset(datasource.processed_data, datasource.file_name);
        dataInsights.push(analysis);

        // Aggregate financial metrics
        totalSales += analysis.totalSales || 0;
        totalRevenue += analysis.totalRevenue || 0;
        transactionCount += analysis.recordCount || 0;
      }
    }
  }

  return {
    organization: org || {},
    datasources: datasources || [],
    totalDatasources: datasources?.length || 0,
    industries: org?.industry || 'Unknown',
    setupDate: org?.created_at || null,
    // Enhanced financial data
    totalSales,
    totalRevenue,
    transactionCount,
    dataInsights,
    hasProcessedData: dataInsights.length > 0
  };
}

async function getRecentTransactions(supabase: any, organizationId: string) {
  // Get recent file uploads and data processing activities
  const { data: datasources } = await supabase
    .from('datasources')
    .select('file_name, created_at, status, file_size')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(10);

  return {
    recentFiles: datasources || [],
    count: datasources?.length || 0,
    totalSize: datasources?.reduce((sum: number, d: any) => sum + (d.file_size || 0), 0) || 0,
    lastActivity: datasources?.[0]?.created_at || null
  };
}

async function getDashboardMetrics(supabase: any, organizationId: string) {
  // Get dashboard and widget data
  const { data: dashboards } = await supabase
    .from('dashboards')
    .select('*')
    .eq('organization_id', organizationId);

  const { data: widgets } = await supabase
    .from('widgets')
    .select('*')
    .in('dashboard_id', dashboards?.map(d => d.id) || []);

  return {
    dashboards: dashboards || [],
    widgets: widgets || [],
    totalDashboards: dashboards?.length || 0,
    totalWidgets: widgets?.length || 0
  };
}

async function getCashFlowData(supabase: any, organizationId: string) {
  // Get organization members and activity data as a proxy for business activity
  const { data: members } = await supabase
    .from('organization_members')
    .select(`
      *,
      profiles (full_name, email)
    `)
    .eq('organization_id', organizationId);

  const { data: datasources } = await supabase
    .from('datasources')
    .select('file_name, created_at, processed_data')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(5);

  return {
    teamMembers: members || [],
    dataFiles: datasources || [],
    teamSize: members?.length || 0,
    dataAssets: datasources?.length || 0
  };
}

// Data analysis function
function analyzeDataset(processedData: any[], fileName: string) {
  if (!processedData || processedData.length === 0) {
    return { fileName, recordCount: 0, error: "No data to analyze" };
  }

  const analysis: any = {
    fileName,
    recordCount: processedData.length,
    columns: Object.keys(processedData[0] || {}),
    totalSales: 0,
    totalRevenue: 0,
    insights: []
  };

  // Look for common financial columns
  const salesColumns = analysis.columns.filter((col: string) =>
    col.toLowerCase().includes('sale') ||
    col.toLowerCase().includes('amount') ||
    col.toLowerCase().includes('total') ||
    col.toLowerCase().includes('revenue') ||
    col.toLowerCase().includes('price')
  );

  // Calculate totals from numeric columns
  salesColumns.forEach((column: string) => {
    const total = processedData.reduce((sum, row) => {
      const value = parseFloat(row[column]) || 0;
      return sum + value;
    }, 0);

    if (total > 0) {
      if (column.toLowerCase().includes('sale') || column.toLowerCase().includes('amount')) {
        analysis.totalSales += total;
      }
      if (column.toLowerCase().includes('revenue') || column.toLowerCase().includes('total')) {
        analysis.totalRevenue += total;
      }

      analysis.insights.push({
        column,
        total: total.toLocaleString(),
        average: (total / processedData.length).toFixed(2)
      });
    }
  });

  // Add date analysis if date columns exist
  const dateColumns = analysis.columns.filter((col: string) =>
    col.toLowerCase().includes('date') ||
    col.toLowerCase().includes('time') ||
    col.toLowerCase().includes('created')
  );

  if (dateColumns.length > 0) {
    analysis.hasDateData = true;
    analysis.dateRange = getDateRange(processedData, dateColumns[0]);
  }

  return analysis;
}

function getDateRange(data: any[], dateColumn: string) {
  const dates = data
    .map(row => new Date(row[dateColumn]))
    .filter(date => !isNaN(date.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  if (dates.length === 0) return null;

  return {
    from: dates[0].toLocaleDateString(),
    to: dates[dates.length - 1].toLocaleDateString(),
    span: dates.length
  };
}

// Helper functions to generate summaries
function generateFinancialSummary(data: any): string {
  const {
    organization,
    totalDatasources,
    industries,
    setupDate,
    totalSales,
    totalRevenue,
    transactionCount,
    dataInsights,
    hasProcessedData
  } = data;

  const orgName = organization.name || 'Your Organization';
  const setupYear = setupDate ? new Date(setupDate).getFullYear() : 'Unknown';

  if (!hasProcessedData) {
    return `Organization Overview: ${orgName} in the ${industries} industry, established ${setupYear}. Currently managing ${totalDatasources} data sources for business analytics and insights.`;
  }

  let summary = `## Financial Analysis for ${orgName}\n\n`;
  summary += `**Industry**: ${industries} | **Established**: ${setupYear}\n\n`;

  if (totalSales > 0) {
    summary += `### 💰 Sales Performance\n`;
    summary += `- **Total Sales**: $${totalSales.toLocaleString()}\n`;
    summary += `- **Average per Transaction**: $${(totalSales / transactionCount).toFixed(2)}\n\n`;
  }

  if (totalRevenue > 0 && totalRevenue !== totalSales) {
    summary += `### 📈 Revenue Analysis\n`;
    summary += `- **Total Revenue**: $${totalRevenue.toLocaleString()}\n\n`;
  }

  summary += `### 📊 Data Overview\n`;
  summary += `- **Total Records Analyzed**: ${transactionCount.toLocaleString()}\n`;
  summary += `- **Data Sources**: ${totalDatasources}\n\n`;

  if (dataInsights.length > 0) {
    summary += `### 🔍 Key Insights\n`;
    dataInsights.forEach((insight: any) => {
      summary += `**${insight.fileName}**: ${insight.recordCount} records`;
      if (insight.insights.length > 0) {
        summary += ` with key metrics:\n`;
        insight.insights.forEach((metric: any) => {
          summary += `  - ${metric.column}: $${metric.total} total, $${metric.average} average\n`;
        });
      }
      summary += `\n`;
    });
  }

  return summary;
}

function generateTransactionsSummary(data: any): string {
  const { count, totalSize, lastActivity } = data;
  const lastDate = lastActivity ? new Date(lastActivity).toLocaleDateString() : 'No recent activity';
  const sizeMB = totalSize ? (totalSize / (1024 * 1024)).toFixed(2) : '0';

  return `Data Activity: ${count} files uploaded totaling ${sizeMB}MB of data. Last activity: ${lastDate}. Your data pipeline is actively processing business information.`;
}

function generateMetricsSummary(data: any): string {
  const { totalDashboards, totalWidgets } = data;
  return `Analytics Infrastructure: ${totalDashboards} active dashboards with ${totalWidgets} visualization widgets. Your analytics setup is ${totalDashboards > 0 ? 'operational' : 'ready for configuration'}.`;
}

function generateCashFlowSummary(data: any): string {
  const { teamSize, dataAssets } = data;
  return `Business Intelligence: ${teamSize} team members collaborating on ${dataAssets} data assets. Your organization has ${teamSize > 1 ? 'strong collaborative' : 'individual'} analytics capabilities.`;
}

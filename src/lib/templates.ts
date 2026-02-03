
export interface Template {
  id: string;
  name: string;
  description: string;
  core: {
    fields: string[];
    dataQualityRules: string[];
    baseMetrics: string[];
  };
  editable: {
    kpis: string[];
    thresholds: string[];
    visuals: string[];
    views: string[];
  };
}

export const templates: Template[] = [
  {
    id: 'executive-kpi',
    name: 'Executive KPI',
    description: 'High-level overview of core business metrics for executive reporting.',
    core: {
      fields: ['date', 'revenue', 'costs', 'customer_satisfaction'],
      dataQualityRules: ['Ensure date is in YYYY-MM-DD format', 'Revenue must be a positive number'],
      baseMetrics: ['Total Revenue', 'Net Profit', 'Customer Churn Rate']
    },
    editable: {
      kpis: ['New vs. Returning Customers', 'Revenue per Employee'],
      thresholds: ['Set target for monthly growth', 'Define red/yellow/green for customer satisfaction'],
      visuals: ['Add trend lines to charts', 'Change chart types (bar, line)'],
      views: ['Filter by region', 'Compare with previous period']
    }
  },
  {
    id: 'production-control',
    name: 'Production Control',
    description: 'Detailed metrics for monitoring and optimizing the production line.',
    core: {
      fields: ['timestamp', 'line_id', 'units_produced', 'downtime_minutes', 'scrap_count'],
      dataQualityRules: ['Downtime must be recorded for any stop longer than 5 minutes'],
      baseMetrics: ['Overall Equipment Effectiveness (OEE)', 'Production Volume', 'Scrap Rate']
    },
    editable: {
      kpis: ['Units per hour', 'Downtime by reason code'],
      thresholds: ['Set OEE target', 'Define acceptable scrap rate'],
      visuals: ['Visualize downtime reasons in a Pareto chart'],
      views: ['Filter by shift', 'Analyze performance per product']
    }
  },
  {
    id: 'inventory-materials',
    name: 'Inventory & Materials',
    description: 'Track stock levels, material flow, and supply chain efficiency.',
    core: {
      fields: ['sku', 'location', 'quantity_on_hand', 'last_movement_date'],
      dataQualityRules: ['SKU must match master product list'],
      baseMetrics: ['Inventory Turnover', 'Days of Supply', 'Stock-to-Sales Ratio']
    },
    editable: {
      kpis: ['Slow-moving inventory', 'Stockout frequency'],
      thresholds: ['Set reorder points', 'Define safety stock levels'],
      visuals: ['ABC analysis chart'],
      views: ['Filter by warehouse', 'View by supplier']
    }
  },
  {
    id: 'from-scratch',
    name: 'From Scratch',
    description: 'A blank canvas to build a fully custom dashboard with a guided setup.',
    core: {
      fields: ['date', 'entity', 'metric', 'value', 'source_sheet'],
      dataQualityRules: ['Base structure for IA compatibility'],
      baseMetrics: ['Customizable']
    },
    editable: {
      kpis: ['User-defined'],
      thresholds: ['User-defined'],
      visuals: ['User-defined'],
      views: ['User-defined']
    }
  }
];

export const getTemplates = () => templates;

export const getTemplate = (id: string) => templates.find(t => t.id === id);


import { format, subDays, subHours } from 'date-fns';

export type TemplateType = 'construction';

export interface DemoRow {
  id: string;
  [key: string]: any;
}

export interface KPIData {
  label: string;
  value: string;
  change: string; // e.g. "+12%"
  trend: 'up' | 'down' | 'neutral';
  color: 'blue' | 'green' | 'red' | 'orange';
}

// --- Generators ---

export const generateMessyData = (): DemoRow[] => {
    return [
        { id: '1', 'Date': '2024-03-01', 'Item': 'Concrete Mix', 'Category': 'Materials', 'Cost': '$12,500', 'Project': 'Site A', 'Vendor': 'BuildCo' },
        { id: '2', 'Date': '03/01/24', 'Item': 'Labor - Day Shift', 'Category': 'Labor', 'Cost': '4500', 'Project': 'site a', 'Vendor': 'Internal' },
        { id: '3', 'Date': '2024-03-02', 'Item': 'Steel Beams', 'Category': 'Materials', 'Cost': '$28,000', 'Project': 'Site B', 'Vendor': 'SteelCorp' },
        { id: '4', 'Date': 'Mar 2, 2024', 'Item': 'Excavator Rental', 'Category': 'Equipment', 'Cost': '1200', 'Project': 'Site A', 'Vendor': 'Rentals Inc' },
        { id: '5', 'Date': '2024-03-03', 'Item': 'Electrical Wiring', 'Category': 'Materials', 'Cost': '$5,400', 'Project': 'Site C', 'Vendor': 'WireTech' },
        { id: '6', 'Date': '2024-03-03', 'Item': 'Labor - Electricians', 'Category': 'labor', 'Cost': '3200', 'Project': 'Site C', 'Vendor': 'Subcontractor' },
        { id: '7', 'Date': '2024-03-04', 'Item': 'Plumbing Fixtures', 'Category': 'Materials', 'Cost': '$8,900', 'Project': 'Site B', 'Vendor': 'PlumbSupply' },
        { id: '8', 'Date': '03-04-2024', 'Item': 'Crane Operator', 'Category': 'Labor', 'Cost': '1500', 'Project': 'Site B', 'Vendor': 'Internal' },
        { id: '9', 'Date': '2024-03-05', 'Item': 'Roofing Tiles', 'Category': 'Materials', 'Cost': 'null', 'Project': 'Site A', 'Vendor': 'Roofers' },
        { id: '10', 'Date': '2024-03-05', 'Item': 'Safety Gear', 'Category': 'Safety', 'Cost': '$500', 'Project': 'All', 'Vendor': 'SafeEquip' },
        { id: '11', 'Date': '2024-03-06', 'Item': 'Cement Bags', 'Category': 'Materials', 'Cost': '$2,100', 'Project': 'Site A', 'Vendor': 'BuildCo' },
        { id: '12', 'Date': '2024-03-06', 'Item': 'Labor - General', 'Category': 'Labor', 'Cost': '2800', 'Project': 'Site A', 'Vendor': 'Internal' },
        { id: '13', 'Date': '2024-03-07', 'Item': 'Insulation', 'Category': 'Materials', 'Cost': '$4,200', 'Project': 'Site C', 'Vendor': 'InsulateIt' },
        { id: '14', 'Date': '2024-03-07', 'Item': 'Paint', 'Category': 'Materials', 'Cost': '$1,800', 'Project': 'Site C', 'Vendor': 'Colors Inc' },
        { id: '15', 'Date': '2024-03-08', 'Item': 'Windows', 'Category': 'Materials', 'Cost': '$15,000', 'Project': 'Site B', 'Vendor': 'GlassWorks' },
    ];
};

export const generateCleanData = (): DemoRow[] => {
    // Top cost drivers
    return [
        { id: '1', 'Item': 'Steel Structure Phase 2', 'Category': 'Materials', 'Cost': '$145,000', 'Change': '+12%', 'Notes': 'Price hike due to shortage' },
        { id: '2', 'Item': 'HVAC System Install', 'Category': 'Subcontractor', 'Cost': '$85,000', 'Change': '0%', 'Notes': 'On budget' },
        { id: '3', 'Item': 'Foundation Concrete', 'Category': 'Materials', 'Cost': '$62,500', 'Change': '+5%', 'Notes': 'Volume increased by 5%' },
        { id: '4', 'Item': 'Site Labor - March', 'Category': 'Labor', 'Cost': '$58,000', 'Change': '-2%', 'Notes': 'Efficiency improved' },
        { id: '5', 'Item': 'Heavy Equipment Rental', 'Category': 'Equipment', 'Cost': '$42,000', 'Change': '+15%', 'Notes': 'Extended rental period' },
        { id: '6', 'Item': 'Electrical Main Panel', 'Category': 'Materials', 'Cost': '$35,000', 'Change': '+8%', 'Notes': 'Expedited shipping' },
        { id: '7', 'Item': 'Plumbing Rough-in', 'Category': 'Labor', 'Cost': '$28,000', 'Change': '0%', 'Notes': 'Standard rate' },
        { id: '8', 'Item': 'Roofing Material', 'Category': 'Materials', 'Cost': '$25,500', 'Change': '-5%', 'Notes': 'Bulk discount applied' },
        { id: '9', 'Item': 'Safety Inspections', 'Category': 'Safety', 'Cost': '$12,000', 'Change': '+20%', 'Notes': 'Additional audit required' },
        { id: '10', 'Item': 'Waste Removal', 'Category': 'Services', 'Cost': '$8,500', 'Change': '+2%', 'Notes': 'Regular pickup' },
    ];
};

export const calculateKPIs = (): KPIData[] => {
    return [
        { label: 'Total Cost', value: '$1,245,000', change: '+12.5%', trend: 'up', color: 'red' }, // Cost up is bad usually, or neutral
        { label: 'Labor Cost', value: '$385,000', change: '-2.1%', trend: 'down', color: 'green' }, // Labor down is good
        { label: 'Materials Cost', value: '$650,000', change: '+18.3%', trend: 'up', color: 'red' }, // Materials up bad
        { label: 'Schedule Variance', value: '+5 Days', change: '+2 Days', trend: 'up', color: 'orange' } // Delay increasing
    ];
};

export const generateChartData = () => {
    const totalCostOverTime = [
        { name: 'Week 1', value: 250000, budget: 240000 },
        { name: 'Week 2', value: 280000, budget: 240000 },
        { name: 'Week 3', value: 310000, budget: 250000 }, // Spike
        { name: 'Week 4', value: 405000, budget: 260000 }, // Big spike
    ];

    const costByCategory = [
        { name: 'Materials', value: 650000 },
        { name: 'Labor', value: 385000 },
        { name: 'Equipment', value: 120000 },
        { name: 'Subcontractors', value: 90000 },
    ];

    const costDistribution = [
        { name: 'Materials', value: 52 },
        { name: 'Labor', value: 31 },
        { name: 'Other', value: 17 },
    ];

    return { totalCostOverTime, costByCategory, costDistribution };
};

// --- AI Logic ---

export interface ChatResponse {
    insights: string[];
    recommendedChart: string;
    actions: string[];
}

export const getAIChatResponse = (prompt: string): ChatResponse => {
    // DEFAULT RESPONSE
    const defaultResponse = {
        insights: [
            "Costs spiked by **18%** this week due to expedited steel delivery.",
            "Labor efficiency improved by **2%**, saving an estimated $12k.",
            "Material variance is the primary driver of budget overrun."
        ],
        recommendedChart: "Total Cost vs Budget (Line Chart)",
        actions: ["Show Chart", "Generate Summary"]
    };

    // --- REFRAMED RESPONSES FOR DECISION-FIRST POSITIONING ---

    if (prompt.includes("increase") || prompt.includes("spike")) {
        return {
            insights: [
                "**Cost Impact**: Materials jumped $45k. This is NOT a volume issue; it's a **price variance** from Vendor 'SteelCorp'.",
                "**Why**: Emergency order placed on 03/02 bypassed standard approval.",
                "**Action**: Enforce PO limits for Site B to prevent recurrence."
            ],
            recommendedChart: "Cost by Category",
            actions: ["Highlight Vendor", "Audit Site B POs"]
        };
    }
    
    if (prompt.includes("Compare")) {
        return {
            insights: [
                "**Trend**: We are burning cash **12% faster** than last month.",
                "**Driver**: Steel Structure Phase 2 started early, but billing is ahead of progress.",
                "**Risk**: At this rate, Site B budget will be exhausted by Day 20."
            ],
            recommendedChart: "Total Cost vs Budget",
            actions: ["Freeze Non-Critical Spend", "Review Schedule"]
        };
    }

    if (prompt.includes("drivers") || prompt.includes("biggest")) {
        return {
            insights: [
                "**#1 Problem**: Steel Structure ($145k) is 12% over budget due to shortage pricing.",
                "**#2 Problem**: Heavy Equipment ($42k) is 15% over. Rentals are sitting idle on weekends.",
                "**Good News**: Labor is under budget by 2%. Shift efficiency is holding."
            ],
            recommendedChart: "Top Cost Drivers Table",
            actions: ["Return Idle Rentals", "Renegotiate Steel"]
        };
    }

    if (prompt.includes("risks") || prompt.includes("week")) {
        return {
            insights: [
                "**Critical Risk**: Schedule has slipped **5 days**. Overtime labor will likely be triggered next week to catch up.",
                "**Supply Risk**: Roofing tiles show 'null' inventory in system. Potential stoppage.",
                "**Financial**: Material costs are trending +18% vs bid."
            ],
            recommendedChart: "Schedule Variance KPI",
            actions: ["Approve Overtime", "Check Inventory"]
        };
    }

    return defaultResponse;
};

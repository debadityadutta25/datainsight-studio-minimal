export interface SampleDataset {
  id: string;
  name: string;
  filename: string;
  type: 'csv' | 'json';
  description: string;
  rawContent: string;
}

export const SAMPLE_DATASETS: SampleDataset[] = [
  {
    id: 'ecommerce',
    name: 'E-Commerce Global Sales',
    filename: 'global_sales_2025.csv',
    type: 'csv',
    description: 'Orders with categories, revenue, discounts, regions, and customer ratings',
    rawContent: `order_id,customer_id,region,category,product_name,unit_price,quantity,discount,total_revenue,order_date,is_returned
ORD-1001,CUST-501,North America,Electronics,Noise-Cancelling Headphones,199.99,2,0.1,359.98,2025-01-05,false
ORD-1002,CUST-502,Europe,Furniture,Ergonomic Office Chair,349.50,1,0.05,332.02,2025-01-07,false
ORD-1003,CUST-503,Asia Pacific,Electronics,Ultra-Wide 4K Monitor,499.00,3,0.15,1272.45,2025-01-09,false
ORD-1004,CUST-504,North America,Office Supplies,Wireless Keyboard & Mouse,79.99,5,0.0,399.95,2025-01-12,false
ORD-1005,CUST-505,Latin America,Electronics,Bluetooth Speaker,59.90,4,0.2,191.68,2025-01-14,true
ORD-1006,CUST-506,Europe,Furniture,Standing Desk Converter,220.00,2,0.1,396.00,2025-01-18,false
ORD-1007,CUST-507,North America,Electronics,USB-C Docking Station,129.99,3,0.05,370.47,2025-01-20,false
ORD-1008,CUST-508,Asia Pacific,Office Supplies,Executive Fountain Pen,45.00,10,0.15,382.50,2025-01-22,false
ORD-1009,CUST-509,Europe,Electronics,Smart Fitness Tracker,89.50,2,0.0,179.00,2025-01-25,false
ORD-1010,CUST-510,North America,Furniture,Leather Executive Chair,420.00,1,0.2,336.00,2025-01-28,true
ORD-1011,CUST-511,Asia Pacific,Electronics,Gaming Mechanical Keyboard,149.99,4,0.1,539.96,2025-02-02,false
ORD-1012,CUST-512,Latin America,Office Supplies,Heavy-Duty Paper Shredder,110.00,1,0.0,110.00,2025-02-04,false
ORD-1013,CUST-513,North America,Electronics,Webcam 1080p Pro,85.00,6,0.12,448.80,2025-02-06,false
ORD-1014,CUST-514,Europe,Electronics,Tablet 11-Inch,649.00,2,0.05,1233.10,2025-02-09,false
ORD-1015,CUST-515,North America,Furniture,Dual Monitor Arm,95.00,3,0.08,262.20,2025-02-12,false
ORD-1016,CUST-516,Asia Pacific,Office Supplies,Filing Cabinet 3-Drawer,185.00,2,0.1,333.00,2025-02-15,false
ORD-1017,CUST-517,Europe,Electronics,Wireless Earbuds,119.99,5,0.15,509.96,2025-02-18,true
ORD-1018,CUST-518,North America,Furniture,Bookshelf Wood Finish,210.00,1,0.0,210.00,2025-02-21,false
ORD-1019,CUST-519,Latin America,Electronics,Portable Power Bank 20000mAh,39.99,8,0.2,255.94,2025-02-23,false
ORD-1020,CUST-520,Asia Pacific,Electronics,Smart Watch Series 7,299.00,2,0.05,568.10,2025-02-27,false`,
  },
  {
    id: 'employees',
    name: 'Tech Workforce & Compensation',
    filename: 'employee_roster.json',
    type: 'json',
    description: 'Engineering, Sales, and Product staff with compensation, ratings, and tenure',
    rawContent: JSON.stringify([
      { emp_id: 'EMP-01', name: 'Sophia Chen', department: 'Engineering', role: 'Staff ML Engineer', salary: 185000, bonus: 25000, performance_score: 4.8, remote: true, hire_date: '2021-03-15' },
      { emp_id: 'EMP-02', name: 'Marcus Johnson', department: 'Engineering', role: 'Senior Backend Engineer', salary: 152000, bonus: 18000, performance_score: 4.5, remote: false, hire_date: '2020-07-01' },
      { emp_id: 'EMP-03', name: 'Elena Rostova', department: 'Product', role: 'Principal Product Manager', salary: 172000, bonus: 22000, performance_score: 4.9, remote: true, hire_date: '2019-11-10' },
      { emp_id: 'EMP-04', name: 'Liam O’Connor', department: 'Sales', role: 'Account Executive', salary: 95000, bonus: 45000, performance_score: 4.2, remote: true, hire_date: '2022-01-20' },
      { emp_id: 'EMP-05', name: 'Aisha Al-Mansoor', department: 'Data', role: 'Lead Data Scientist', salary: 168000, bonus: 20000, performance_score: 4.7, remote: false, hire_date: '2021-09-01' },
      { emp_id: 'EMP-06', name: 'David Kim', department: 'Engineering', role: 'DevOps Architect', salary: 160000, bonus: 19000, performance_score: 4.6, remote: true, hire_date: '2020-02-18' },
      { emp_id: 'EMP-07', name: 'Chloe Dubois', department: 'Marketing', role: 'Brand Director', salary: 140000, bonus: 15000, performance_score: 4.1, remote: false, hire_date: '2022-05-12' },
      { emp_id: 'EMP-08', name: 'Rajesh Patel', department: 'Engineering', role: 'Frontend Engineer', salary: 125000, bonus: 12000, performance_score: 4.4, remote: true, hire_date: '2023-02-01' },
      { emp_id: 'EMP-09', name: 'Hannah Schmidt', department: 'Sales', role: 'VP Global Sales', salary: 210000, bonus: 75000, performance_score: 4.9, remote: false, hire_date: '2018-08-14' },
      { emp_id: 'EMP-10', name: 'Carlos Mendez', department: 'Data', role: 'Data Engineer', salary: 135000, bonus: 14000, performance_score: 4.3, remote: true, hire_date: '2022-08-15' },
      { emp_id: 'EMP-11', name: 'Emily Taylor', department: 'Product', role: 'UI/UX Designer', salary: 118000, bonus: 10000, performance_score: 4.5, remote: true, hire_date: '2023-04-10' },
      { emp_id: 'EMP-12', name: 'Tariq Hassan', department: 'Engineering', role: 'Security Engineer', salary: 155000, bonus: 18000, performance_score: 4.6, remote: false, hire_date: '2021-11-28' },
      { emp_id: 'EMP-13', name: 'Olivia Martin', department: 'Sales', role: 'Enterprise Account Exec', salary: 105000, bonus: 52000, performance_score: 4.7, remote: true, hire_date: '2021-06-15' },
      { emp_id: 'EMP-14', name: 'Vikram Singh', department: 'Marketing', role: 'Growth Specialist', salary: 98000, bonus: 11000, performance_score: 3.9, remote: true, hire_date: '2023-07-20' },
      { emp_id: 'EMP-15', name: 'Grace Hopper', department: 'Engineering', role: 'Engineering Manager', salary: 198000, bonus: 32000, performance_score: 5.0, remote: false, hire_date: '2017-04-01' },
    ], null, 2),
  },
  {
    id: 'saas_metrics',
    name: 'SaaS Customer Subscriptions',
    filename: 'saas_accounts_mrr.csv',
    type: 'csv',
    description: 'B2B subscription tiers, monthly recurring revenue, NPS, and churn statuses',
    rawContent: `account_id,company_name,tier,mrr,users_count,nps_score,country,churn_status,signup_date
AC-8801,Acme Corp,Enterprise,4500,250,9,United States,active,2023-01-15
AC-8802,BlueSky Media,Growth,1200,45,8,United Kingdom,active,2023-03-22
AC-8803,Apex Logistics,Starter,299,10,6,Canada,churned,2023-05-10
AC-8804,Nova Health,Enterprise,6200,480,10,Germany,active,2022-11-04
AC-8805,Quantum Robotics,Growth,1500,60,9,Japan,active,2023-08-19
AC-8806,Starlight Gaming,Starter,499,15,7,United States,active,2024-01-08
AC-8807,Helix Genomics,Enterprise,5800,320,10,Switzerland,active,2023-02-14
AC-8808,Zenith Financial,Enterprise,7500,600,8,United Kingdom,active,2022-09-30
AC-8809,Terra Agro,Starter,199,8,5,Brazil,churned,2023-07-03
AC-8810,Vortex AI,Growth,2100,85,9,United States,active,2023-10-11
AC-8811,Pulse Telecom,Enterprise,8200,750,7,Australia,active,2022-06-18
AC-8812,Beacon Logistics,Growth,1350,50,8,Singapore,active,2024-02-05
AC-8813,Solaria Energy,Starter,399,12,6,Spain,churned,2023-09-12
AC-8814,CyberGuard Inc,Growth,2400,95,10,United States,active,2023-04-17
AC-8815,Nordic NordicTech,Enterprise,4900,280,9,Sweden,active,2023-06-25`,
  },
];

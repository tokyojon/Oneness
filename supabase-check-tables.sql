-- Check what auth tables exist in your Supabase version
-- Run this first to see available tables

SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema LIKE '%auth%' 
ORDER BY table_name;

-- Also check if there are any configuration tables
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name LIKE '%config%' OR table_name LIKE '%template%' OR table_name LIKE '%email%'
ORDER BY table_name;

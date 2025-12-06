-- Check Triggers
SELECT 
    event_object_table as table,
    trigger_name, 
    event_manipulation as event,
    action_timing as timing
FROM information_schema.triggers 
WHERE event_object_table = 'user_profiles';

-- Check for Non-Nullable columns (Constraints)
SELECT column_name, is_nullable, data_type
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND is_nullable = 'NO';

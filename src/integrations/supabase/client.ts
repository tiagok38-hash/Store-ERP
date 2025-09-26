import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xcvegttacfnqpeenfkaz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjdmVndHRhY2ZucXBlZW5ma2F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2ODEwNjksImV4cCI6MjA3NDI1NzA2OX0.5MRanKIpYFf21eeNzXAEeti_tzvbiO20scIqmSfUHMU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
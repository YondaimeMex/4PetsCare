import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vttcrwwrmkhlislqaayd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0dGNyd3dybWtobGlzbHFhYXlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NDkyOTksImV4cCI6MjA4NjIyNTI5OX0.DCXmk28nWJR2d2y1E1deFvDGWpTnFxkqHfFnAuf5y5M';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
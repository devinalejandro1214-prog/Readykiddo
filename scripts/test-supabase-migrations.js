const { existsSync, readFileSync } = require('fs');
const { join } = require('path');

const root = join(__dirname, '..');
const files = [
  'supabase/schema.sql',
  'supabase/migrations/20260714090000_add_session_telemetry.sql',
  'supabase/migrations/20260714100000_expand_child_age_ranges.sql',
  'supabase/migrations/20260715100000_add_name_spelling_progress.sql'
];
let failures = 0;

function read(file) {
  const path = join(root, file);
  if (!existsSync(path)) {
    failures += 1;
    console.error(`Missing Supabase SQL file: ${file}`);
    return '';
  }
  return readFileSync(path, 'utf8');
}

const sql = Object.fromEntries(files.map(file => [file, read(file)]));
const allSql = Object.values(sql).join('\n');

for (const forbidden of [
  /\btruncate\b/i,
  /\bdelete\s+from\b/i,
  /\bdrop\s+table\b/i,
  /\bdrop\s+schema\b/i,
  /service_role/i,
  /grant\s+all/i
]) {
  if (forbidden.test(allSql)) {
    failures += 1;
    console.error(`Unsafe SQL pattern found: ${forbidden}`);
  }
}

const schema = sql['supabase/schema.sql'];
for (const required of [
  'create table if not exists public.profiles',
  'create table if not exists public.children',
  'create table if not exists public.game_sessions',
  'alter table public.profiles      enable row level security',
  'alter table public.children      enable row level security',
  'alter table public.game_sessions enable row level security',
  'auth.uid() = parent_id',
  'auth.uid() = (select parent_id from public.children where id = child_id)'
]) {
  if (!schema.includes(required)) {
    failures += 1;
    console.error(`Schema contract missing: ${required}`);
  }
}

if (!schema.includes("age_range  text not null check (age_range in ('3-4', '4-5'))")) {
  failures += 1;
  console.error('Baseline age contract is not explicit.');
}

const ageMigration = sql['supabase/migrations/20260714100000_expand_child_age_ranges.sql'];
if (!ageMigration.includes("'3-4', '4-5', '5-6', '6-8'")) {
  failures += 1;
  console.error('Age migration does not include all supported ranges.');
}

const telemetry = sql['supabase/migrations/20260714090000_add_session_telemetry.sql'];
for (const required of ['telemetry_version', 'telemetry_support_level', 'telemetry jsonb', 'validate constraint']) {
  if (!telemetry.includes(required)) {
    failures += 1;
    console.error(`Telemetry migration contract missing: ${required}`);
  }
}

const nameProgress = sql['supabase/migrations/20260715100000_add_name_spelling_progress.sql'];
for (const required of ['name_spelling_progress jsonb', 'jsonb_typeof(name_spelling_progress) = \'object\'']) {
  if (!nameProgress.includes(required)) {
    failures += 1;
    console.error(`Name-progress migration contract missing: ${required}`);
  }
}

const client = read('assets/js/supabase-client.js');
if (!client.includes('https://mqzbecwyubyifbjcvttk.supabase.co') || !client.includes('sb_publishable_T1cGPZcWizDyxxEq8-5CdA_IS4KuvSY')) {
  failures += 1;
  console.error('Browser Supabase client is not configured for the production project.');
}

const onboarding = read('assets/js/onboarding.js');
if (!onboarding.includes("value:'5-6'") || !onboarding.includes('could not be saved')) {
  failures += 1;
  console.error('Onboarding age/error contract is incomplete.');
}

if (failures) process.exit(1);
console.log('Supabase migration and ownership checks passed.');

-- ═══════════════════════════════════════════════════════════════
-- TASK NAME: PERMISSIONS-RBAC
-- Phase: 4 · Access & Permissions (role presets + per-user overrides)
-- Run order: after core profiles/RLS are in place. Standalone.
-- Repeat safety: FULLY IDEMPOTENT — safe to re-run any number of times.
-- ---------------------------------------------------------------
-- Adds a data-driven permission layer on top of the 5 roles:
--   • permission_catalog  → reference of every capability (also powers
--                            the admin "explanation table", bilingual)
--   • role_presets        → role → default capabilities
--   • profiles.permissions→ per-user JSONB overrides {cap: true|false}
--   • has_permission()    → effective check (override wins over preset)
--   • admin_set_permissions() → guarded write (owner + admin protected)
-- No existing RLS is dropped; admin/owner always retain full access.
-- ═══════════════════════════════════════════════════════════════
do $$ begin raise notice '▶ TASK: PERMISSIONS-RBAC — starting'; end $$;

-- ─── 1. Per-user overrides column ───────────────────────────────
alter table public.profiles
  add column if not exists permissions jsonb not null default '{}'::jsonb;

-- ─── 2. Capability catalog (reference + UI explanation table) ───
create table if not exists public.permission_catalog (
  cap        text primary key,
  grp        text not null,                 -- access | content | review | admin
  label_en   text not null,
  label_ar   text not null,
  desc_en    text not null default '',
  desc_ar    text not null default '',
  affects    text not null default '',       -- pages/areas impacted
  baseline   boolean not null default false, -- always-on, cannot be revoked
  sort       int  not null default 100
);

insert into public.permission_catalog (cap, grp, label_en, label_ar, desc_en, desc_ar, affects, baseline, sort) values
  ('view_atlas',       'access',  'Browse Atlas · Compare · Learn', 'تصفّح الأطلس والمقارنة والتعلّم', 'Read-only access to public educational content.', 'وصول قراءة للمحتوى التعليمي العام.', 'atlas · comparison · learn', true, 10),
  ('author_prompts',   'content', 'Author prompts in Studio',       'تأليف البرومبت في الاستوديو',    'Create and export generation prompts in the Studio.', 'إنشاء وتصدير برومبتات التوليد في الاستوديو.', 'studio', false, 20),
  ('upload_images',    'content', 'Upload images (bulk)',           'رفع الصور (جماعي)',              'Submit generated images to the review queue.', 'إرسال الصور المولّدة إلى طابور المراجعة.', 'bulk-upload · contribute', false, 21),
  ('translate',        'content', 'Translate terminology',          'ترجمة المصطلحات',                'Edit Arabic/English terms in the dictionary.', 'تحرير المصطلحات العربية/الإنجليزية في القاموس.', 'dictionary', false, 22),
  ('approve_own',      'review',  'Approve own uploads',            'اعتماد صوره الشخصية',            'Approve images the user uploaded themselves.', 'اعتماد الصور التي رفعها المستخدم بنفسه.', 'review', false, 30),
  ('approve_others',   'review',  'Approve others'' uploads',       'اعتماد صور الآخرين',             'Approve images uploaded by any contributor.', 'اعتماد الصور المرفوعة من أي مساهم.', 'review', false, 31),
  ('publish_atlas',    'review',  'Publish to Atlas',               'النشر على الأطلس',               'Push approved images live to the public Atlas.', 'نشر الصور المعتمدة إلى الأطلس العام.', 'review → atlas', false, 32),
  ('flag_quality',     'review',  'Flag & quality review',          'وسم الجودة والمراجعة',           'Flag content and set quality/coherence scores.', 'وسم المحتوى وضبط درجات الجودة والاتساق.', 'review · anatomy-review', false, 33),
  ('admin_console',    'admin',   'Access Admin Console',           'دخول لوحة الإدارة',              'Open the admin console (scoped by other caps).', 'فتح لوحة الإدارة (محدودة بباقي الصلاحيات).', 'admin', false, 40),
  ('manage_content',   'admin',   'Manage mnemonics · cards · team','إدارة المحتوى والفريق',          'Create/edit mnemonics, cards and contributors.', 'إنشاء/تعديل المخططات والبطاقات والمساهمين.', 'admin', false, 41),
  ('manage_users',     'admin',   'Manage users & permissions',     'إدارة المستخدمين والصلاحيات',    'Change roles, assign permissions, invite/disable.', 'تغيير الأدوار ومنح الصلاحيات والدعوة/التعطيل.', 'admin', false, 42),
  ('platform_settings','admin',   'Platform settings',              'إعدادات المنصّة',                'Feature flags and platform-wide switches.', 'مفاتيح الميزات والإعدادات العامة للمنصّة.', 'admin', false, 43)
on conflict (cap) do update set
  grp=excluded.grp, label_en=excluded.label_en, label_ar=excluded.label_ar,
  desc_en=excluded.desc_en, desc_ar=excluded.desc_ar, affects=excluded.affects,
  baseline=excluded.baseline, sort=excluded.sort;

-- ─── 3. Role presets (role → default capabilities) ─────────────
create table if not exists public.role_presets (
  role text primary key,
  caps text[] not null default '{}'
);

insert into public.role_presets (role, caps) values
  ('viewer',      array['view_atlas']),
  ('trial',       array['view_atlas']),
  ('contributor', array['view_atlas','author_prompts','upload_images','approve_own']),
  ('reviewer',    array['view_atlas','author_prompts','upload_images','approve_own','approve_others','publish_atlas','flag_quality','admin_console']),
  ('admin',       array['view_atlas','author_prompts','upload_images','translate','approve_own','approve_others','publish_atlas','flag_quality','admin_console','manage_content','manage_users','platform_settings'])
on conflict (role) do update set caps=excluded.caps;

-- ─── 4. Effective-permission check ─────────────────────────────
-- Override (profiles.permissions) wins over role preset. Admin always full.
create or replace function public.has_permission(p_user uuid, p_cap text)
returns boolean
language sql stable security definer set search_path = public as $$
  with p as (
    select role::text as role, coalesce(permissions,'{}'::jsonb) as perms
    from public.profiles where id = p_user
  )
  select case
    when (select role from p) is null then false
    when (select role from p) = 'admin' then true                       -- admin = full
    when (select perms from p) ? p_cap then ((select perms from p) ->> p_cap)::boolean
    else exists (
      select 1 from public.role_presets rp
      where rp.role = (select role from p) and p_cap = any(rp.caps)
    )
  end;
$$;

-- Convenience wrapper for the current session user
create or replace function public.my_permission(p_cap text)
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_permission(auth.uid(), p_cap);
$$;

-- Full effective set for a user (used by admin console + gating)
create or replace function public.effective_permissions(p_user uuid)
returns text[]
language sql stable security definer set search_path = public as $$
  with p as (select role::text as role, coalesce(permissions,'{}'::jsonb) perms from public.profiles where id=p_user),
  base as (select unnest(rp.caps) cap from public.role_presets rp where rp.role=(select role from p)),
  overrides_on  as (select key cap from jsonb_each_text((select perms from p)) where value='true'),
  overrides_off as (select key cap from jsonb_each_text((select perms from p)) where value='false')
  select coalesce(array_agg(distinct cap), '{}') from (
    select cap from base
    union select cap from overrides_on
    except select cap from overrides_off
  ) s;
$$;

-- ─── 5. Guarded write RPC (admin console → save) ───────────────
create or replace function public.admin_set_permissions(
  p_user uuid, p_role text, p_overrides jsonb
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_actor uuid := auth.uid();
  v_target_email text;
  v_old_role text;
begin
  -- caller must have manage_users
  if not public.has_permission(v_actor, 'manage_users') then
    raise exception 'forbidden: manage_users required';
  end if;
  -- validate role
  if p_role is not null and not exists (select 1 from public.role_presets where role=p_role) then
    raise exception 'invalid role: %', p_role;
  end if;

  select email, role::text into v_target_email, v_old_role from public.profiles where id=p_user;

  -- owner protection: cannot demote or strip the platform owner
  if lower(coalesce(v_target_email,'')) = 'omniradai@gmail.com'
     and (coalesce(p_role,'admin') <> 'admin') then
    raise exception 'owner account is permanently protected';
  end if;

  update public.profiles
    set role = coalesce(p_role::user_role, role),
        permissions = coalesce(p_overrides, '{}'::jsonb)
    where id = p_user;

  -- audit trail (best-effort)
  begin
    insert into public.activity_log(actor_id, action, target_type, target_id, details)
    values (v_actor, 'permissions_change', 'user', p_user::text,
            jsonb_build_object('email',v_target_email,'role_before',v_old_role,'role_after',coalesce(p_role,v_old_role),'overrides',coalesce(p_overrides,'{}'::jsonb)));
  exception when others then null; end;

  return jsonb_build_object('ok',true,'user',p_user,'role',coalesce(p_role,v_old_role),'overrides',coalesce(p_overrides,'{}'::jsonb));
end;
$$;

-- ─── 6. RLS: read access to catalog/presets for signed-in users ─
alter table public.permission_catalog enable row level security;
alter table public.role_presets       enable row level security;

drop policy if exists pc_read on public.permission_catalog;
create policy pc_read on public.permission_catalog for select using (auth.role() = 'authenticated');

drop policy if exists rp_read on public.role_presets;
create policy rp_read on public.role_presets for select using (auth.role() = 'authenticated');

-- Only manage_users may edit catalog/presets
drop policy if exists pc_write on public.permission_catalog;
create policy pc_write on public.permission_catalog for all
  using (public.has_permission(auth.uid(),'manage_users'))
  with check (public.has_permission(auth.uid(),'manage_users'));

drop policy if exists rp_write on public.role_presets;
create policy rp_write on public.role_presets for all
  using (public.has_permission(auth.uid(),'manage_users'))
  with check (public.has_permission(auth.uid(),'manage_users'));

grant execute on function public.has_permission(uuid,text)      to authenticated;
grant execute on function public.my_permission(text)            to authenticated;
grant execute on function public.effective_permissions(uuid)    to authenticated;
grant execute on function public.admin_set_permissions(uuid,text,jsonb) to authenticated;

-- ─── Sanity checks ─────────────────────────────────────────────
do $$
declare n_caps int; n_roles int;
begin
  select count(*) into n_caps  from public.permission_catalog;
  select count(*) into n_roles from public.role_presets;
  raise notice '   catalog capabilities: %', n_caps;   -- expect 12
  raise notice '   role presets: %', n_roles;          -- expect 5
end $$;

do $$ begin raise notice '✔ TASK: PERMISSIONS-RBAC — completed'; end $$;

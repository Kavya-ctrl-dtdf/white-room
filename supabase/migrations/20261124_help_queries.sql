-- White Room: help queries get a reference number and an automated reply,
-- and signed-in users can read their own queries. Additive: nothing existing is removed or changed.

-- 1. Reference number and the automated reply that was sent
alter table public.contact_messages
  add column if not exists ref             text,
  add column if not exists auto_reply      text,
  add column if not exists auto_replied_at timestamptz;

create unique index if not exists contact_messages_ref_key
  on public.contact_messages (ref) where ref is not null;

-- 2. Signed-in users can read their own queries and the reply (admins already read all)
create policy "Users read their own messages"
  on public.contact_messages for select
  to authenticated
  using (user_id = (select auth.uid()));

-- 3. One function to send a query: saves it, makes the reference number, stores the automated reply
--    and hands the reference back. Visitors who are not signed in can use it too, but still cannot
--    read anything back from the table.
create or replace function public.submit_help_query(
  p_name       text,
  p_email      text,
  p_phone      text,
  p_topic      text,
  p_listing    text,
  p_message    text,
  p_auto_reply text
)
returns text
language plpgsql
security definer set search_path = ''
as $$
declare
  v_ref text;
  v_try int := 0;
begin
  loop
    v_ref := 'HQ-' || upper(substr(md5(gen_random_uuid()::text), 1, 6));
    begin
      insert into public.contact_messages
        (user_id, name, email, phone, topic, listing_id, message, status, ref, auto_reply, auto_replied_at)
      values
        (auth.uid(), p_name, p_email, nullif(p_phone, ''), p_topic, nullif(p_listing, ''), p_message, 'new',
         v_ref, replace(left(coalesce(p_auto_reply, ''), 700), '{ref}', v_ref), now());
      return v_ref;
    exception when unique_violation then
      v_try := v_try + 1;
      if v_try >= 5 then raise; end if;
    end;
  end loop;
end;
$$;

revoke all on function public.submit_help_query(text, text, text, text, text, text, text) from public;
grant execute on function public.submit_help_query(text, text, text, text, text, text, text) to anon, authenticated;

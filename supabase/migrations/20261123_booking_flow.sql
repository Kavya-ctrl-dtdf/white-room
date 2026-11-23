-- White Room: let the database hold the full booking flow.
-- Request -> owner accepts or declines -> guest confirms move-in or reports a problem
-- -> verification desk resolves it. Safe to run once; the bookings table is empty today.

-- 1. Guest and payment details, and the problem report
alter table public.bookings
  add column if not exists booker_name       text,
  add column if not exists booker_phone      text,
  add column if not exists guest_name        text,
  add column if not exists guest_phone       text,
  add column if not exists relation          text,
  add column if not exists monthly_price     int,
  add column if not exists paid_now          int,
  add column if not exists payment_method    text,
  add column if not exists issue_note        text,
  add column if not exists issue_at          timestamptz,
  add column if not exists issue_resolution  text;

alter table public.bookings
  add constraint bookings_payment_method_check
  check (payment_method is null or payment_method in ('upi', 'card'));

-- 2. More booking statuses. New bookings start as requests.
alter table public.bookings drop constraint bookings_status_check;
alter table public.bookings add constraint bookings_status_check
  check (status in ('requested', 'confirmed', 'declined', 'cancelled', 'moved_in', 'issue', 'resolved', 'refunded'));
alter table public.bookings alter column status set default 'requested';

-- 3. Owners may respond to requests on their own homes (the trigger below limits how)
create policy "Owners respond to requests on their homes"
  on public.bookings for update
  using (exists (select 1 from public.listings l
                 where l.id = bookings.listing_id and l.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.listings l
                      where l.id = bookings.listing_id and l.owner_id = (select auth.uid())));

-- 4. Who may change what. Admins and the service role are not limited.
create or replace function public.guard_booking_change()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  is_guest boolean;
  is_owner boolean;
begin
  if current_user in ('postgres', 'service_role', 'supabase_admin') or public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    -- A new booking is always a request, with no problem report attached.
    new.status := 'requested';
    new.issue_note := null;
    new.issue_at := null;
    new.issue_resolution := null;
    return new;
  end if;

  is_guest := old.user_id = auth.uid();
  is_owner := exists (select 1 from public.listings l
                      where l.id = old.listing_id and l.owner_id = auth.uid());

  -- What was booked and paid cannot be rewritten afterwards.
  if new.user_id        is distinct from old.user_id
     or new.listing_id  is distinct from old.listing_id
     or new.stay_for    is distinct from old.stay_for
     or new.move_in     is distinct from old.move_in
     or new.months      is distinct from old.months
     or new.total_price is distinct from old.total_price
     or new.monthly_price is distinct from old.monthly_price
     or new.paid_now    is distinct from old.paid_now
     or new.payment_method is distinct from old.payment_method
     or new.booker_name is distinct from old.booker_name
     or new.booker_phone is distinct from old.booker_phone
     or new.guest_name  is distinct from old.guest_name
     or new.guest_phone is distinct from old.guest_phone
     or new.relation    is distinct from old.relation then
    raise exception 'A booking cannot be changed after it is made';
  end if;

  if new.issue_resolution is distinct from old.issue_resolution then
    raise exception 'Only the verification desk can resolve a problem';
  end if;

  if new.status is distinct from old.status then
    if is_owner and old.status = 'requested' and new.status in ('confirmed', 'declined') then
      null;  -- owner accepts or declines
    elsif is_guest and old.status = 'requested' and new.status = 'cancelled' then
      null;  -- guest cancels a request
    elsif is_guest and old.status = 'confirmed' and new.status in ('moved_in', 'issue') then
      null;  -- guest confirms move-in or reports a problem
    else
      raise exception 'That booking status change is not allowed';
    end if;
  end if;

  -- A problem note can only be written by the guest, when reporting the problem.
  if (new.issue_note is distinct from old.issue_note or new.issue_at is distinct from old.issue_at)
     and not (is_guest and old.status = 'confirmed' and new.status = 'issue') then
    raise exception 'A problem can only be reported by the guest after the owner confirms';
  end if;

  return new;
end;
$$;

create trigger bookings_change_guard
  before insert or update on public.bookings
  for each row execute function public.guard_booking_change();

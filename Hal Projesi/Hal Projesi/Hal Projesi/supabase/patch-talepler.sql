-- talepler tablosuna alıcı şirket bilgisi sütunlarını ekler
-- Supabase SQL Editor'de bir kez çalıştırın.

alter table public.talepler add column if not exists alici_sirket_telefon text;
alter table public.talepler add column if not exists alici_sirket_adres text;
alter table public.talepler add column if not exists alici_sirket_vergi_no text;

-- Eksik veritabanı düzeltmeleri (tek seferde çalıştırın)
-- Supabase SQL Editor > + > yapıştır > Run

-- 1) talepler: alıcı şirket bilgileri
alter table public.talepler add column if not exists alici_sirket_telefon text;
alter table public.talepler add column if not exists alici_sirket_adres text;
alter table public.talepler add column if not exists alici_sirket_vergi_no text;

-- 2) satislar: talep onayı / satış kaydı alanları
alter table public.satislar alter column urun_adi drop not null;
alter table public.satislar add column if not exists ciftci_id bigint references public.ciftciler(id) on delete set null;
alter table public.satislar add column if not exists urun_id bigint references public.urunler(id) on delete set null;
alter table public.satislar add column if not exists kalite text;
alter table public.satislar add column if not exists birim_fiyat numeric;
alter table public.satislar add column if not exists toplam_tutar numeric;
alter table public.satislar add column if not exists satis_tarihi date;
alter table public.satislar add column if not exists satis_saati text;
alter table public.satislar add column if not exists durum text;
alter table public.satislar add column if not exists alici_halci_id bigint references public.halciler(id) on delete set null;
alter table public.satislar add column if not exists alici_sirket_adi text;
alter table public.satislar add column if not exists fiyat_teklifi numeric;
alter table public.satislar add column if not exists satici_fiyati numeric;

-- 3) ID sayaçlarını düzelt (yeni kayıt ekleme için)
SELECT setval(pg_get_serial_sequence('public.halciler', 'id'), COALESCE((SELECT MAX(id) FROM public.halciler), 1), true);
SELECT setval(pg_get_serial_sequence('public.ciftciler', 'id'), COALESCE((SELECT MAX(id) FROM public.ciftciler), 1), true);
SELECT setval(pg_get_serial_sequence('public.urunler', 'id'), COALESCE((SELECT MAX(id) FROM public.urunler), 1), true);
SELECT setval(pg_get_serial_sequence('public.satislar', 'id'), COALESCE((SELECT MAX(id) FROM public.satislar), 1), true);
SELECT setval(pg_get_serial_sequence('public.talepler', 'id'), COALESCE((SELECT MAX(id) FROM public.talepler), 1), true);

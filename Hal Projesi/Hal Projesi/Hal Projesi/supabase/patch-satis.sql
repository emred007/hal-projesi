-- Mevcut satislar tablosuna eksik sütunları ekler (SQL Editor'de bir kez çalıştırın)

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

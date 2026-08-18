-- Seed sonrası otomatik ID sayacını düzeltir (yeni kayıt ekleyebilmek için)
-- Supabase SQL Editor'de bir kez çalıştırın.

SELECT setval(pg_get_serial_sequence('public.halciler', 'id'), COALESCE((SELECT MAX(id) FROM public.halciler), 1), true);
SELECT setval(pg_get_serial_sequence('public.ciftciler', 'id'), COALESCE((SELECT MAX(id) FROM public.ciftciler), 1), true);
SELECT setval(pg_get_serial_sequence('public.urunler', 'id'), COALESCE((SELECT MAX(id) FROM public.urunler), 1), true);
SELECT setval(pg_get_serial_sequence('public.satislar', 'id'), COALESCE((SELECT MAX(id) FROM public.satislar), 1), true);
SELECT setval(pg_get_serial_sequence('public.talepler', 'id'), COALESCE((SELECT MAX(id) FROM public.talepler), 1), true);

-- Backfills recipes.cuisine for the 40 rows seeded before that column
-- existed. supabase/seed.sql cannot do this itself: its recipe insert is
-- `on conflict (id) do nothing`, so re-running it never updates a row that
-- was already seeded pre-migration-0003 -- it silently no-ops on all 40.
-- This migration exists specifically to fix already-seeded live databases.
-- Idempotent: safe to paste into the Supabase SQL editor more than once.

update public.recipes set cuisine = 'Punjabi' where id = 'f6189f0e-c154-5d67-8b58-c4acc1238f50'; -- Daal Chawal (Lentils & Rice)
update public.recipes set cuisine = 'Punjabi' where id = '28d0a949-7983-55aa-9bae-41fa61e4645b'; -- Chicken Karahi
update public.recipes set cuisine = 'Punjabi' where id = '7dd8d8f9-511d-52a9-833c-d3550d1b6f86'; -- Aloo Paratha
update public.recipes set cuisine = 'Continental' where id = '72996915-2bd5-50dd-8c0c-0e9b0c45a2e8'; -- Grilled Chicken & Rice
update public.recipes set cuisine = 'Continental' where id = '8b9a626c-2c94-5ee0-92d3-6a38035258cb'; -- Spinach, Egg Scramble
update public.recipes set cuisine = 'Continental' where id = '1dc7e928-6afc-5fce-ad35-86e1e08fa98f'; -- Greek Yogurt Parfait
update public.recipes set cuisine = 'Continental' where id = '56e1a59a-9abf-5620-902a-a47f05c086c6'; -- Oatmeal with Banana
update public.recipes set cuisine = 'Continental' where id = 'd4b79f96-148e-50b7-a282-cac521617b6a'; -- Chickpea Salad
update public.recipes set cuisine = 'Continental' where id = '0e080115-6208-5943-a9fd-79f9209e0c1d'; -- Paneer Tikka Bowl
update public.recipes set cuisine = 'Continental' where id = 'bdef59c3-d8e1-5387-9a34-ca6a85752d45'; -- Tofu Stir Fry
update public.recipes set cuisine = 'Continental' where id = '9c9d4679-0aa9-5838-b54a-5a0a107017c4'; -- Peanut Butter Banana Toast
update public.recipes set cuisine = 'Continental' where id = '5dd8b7a8-6a9e-5f85-8bfd-848ea61da85a'; -- Salmon & Sweet Potato
update public.recipes set cuisine = 'Continental' where id = '178326ad-c7b1-51f7-a8f5-09bc0454d9d0'; -- Chicken Sandwich
update public.recipes set cuisine = 'Continental' where id = 'f66d1eee-472f-5fd5-af28-6da2372f88ab'; -- Apple & Peanut Butter
update public.recipes set cuisine = 'Karachi' where id = '11aaaea6-59fb-5e23-90c3-6ad3eea2f5a1'; -- Chana Chaat
update public.recipes set cuisine = 'Sindhi' where id = 'aae2b21a-111a-5747-9eb2-023495865bc9'; -- Chicken Biryani
update public.recipes set cuisine = 'Punjabi' where id = 'c759ca3c-b686-5c00-be7d-a412cfa2a5ae'; -- Chicken Pulao
update public.recipes set cuisine = 'Karachi' where id = '1f245d7a-5181-5165-8791-04da388bab34'; -- Beef Nihari
update public.recipes set cuisine = 'Karachi' where id = 'df4f60ae-08ce-5ceb-a592-cea6e521c202'; -- Chicken Haleem
update public.recipes set cuisine = 'Balochi' where id = '44fce8f2-3b7a-5c0e-b942-412e02b6141d'; -- Beef Seekh Kebab
update public.recipes set cuisine = 'Pashtun' where id = '3cf68b83-7a07-5fd1-b2b5-bbdfd26dd51c'; -- Beef Chapli Kebab
update public.recipes set cuisine = 'Punjabi' where id = '06f4f4bb-6ca8-503a-8b4c-24052e224dd2'; -- Chicken Tikka
update public.recipes set cuisine = 'Punjabi' where id = 'e6f0d619-94a6-523e-8a8f-20c69185108f'; -- Chicken Malai Boti
update public.recipes set cuisine = 'Pashtun' where id = '603ba3cd-cdb3-59ba-8fe5-1d1b568041cd'; -- Aloo Gosht
update public.recipes set cuisine = 'Balochi' where id = '4c524435-640e-5516-8eef-cdc3ffe975cb'; -- Mutton Karahi
update public.recipes set cuisine = 'Punjabi' where id = '91fb7ec4-a1e8-5a71-9c31-9cb2956de866'; -- Keema Matar
update public.recipes set cuisine = 'Punjabi' where id = 'f0606468-527a-5923-8842-3d1aa5756bab'; -- Chicken Korma
update public.recipes set cuisine = 'Punjabi' where id = 'aa1c38f2-48ab-5da5-b59c-6f3478d9fdd4'; -- Palak Paneer
update public.recipes set cuisine = 'Punjabi' where id = '4e43f2b8-ab19-591b-a6a2-87129bb216ad'; -- Bhindi Masala
update public.recipes set cuisine = 'Punjabi' where id = '7e2875e7-cbf5-5030-94a7-fd67a967d57b'; -- Chana Masala
update public.recipes set cuisine = 'Sindhi' where id = '1552165d-e842-575a-a74a-dd6dc7f7dad5'; -- Daal Mash
update public.recipes set cuisine = 'Karachi' where id = '59fc4580-9ad0-5608-ac6e-5fd141103118'; -- Chicken Handi
update public.recipes set cuisine = 'Sindhi' where id = '51d25f6f-0605-5317-9b22-5190e3851055'; -- Fish Curry (Machli Salan)
update public.recipes set cuisine = 'Sindhi' where id = '79c7c24c-3e64-5a55-b99f-9c2968a4e86b'; -- Prawn Karahi
update public.recipes set cuisine = 'Punjabi' where id = 'eed70462-7092-5eaa-95d5-82c4b6e64ae8'; -- Suji Halwa
update public.recipes set cuisine = 'Punjabi' where id = '24217fcd-e5f9-54dd-975e-ef2eb6d1999d'; -- Kheer
update public.recipes set cuisine = 'Karachi' where id = '18b156e6-c2a8-5a96-b00d-7500c5f08191'; -- Samosa
update public.recipes set cuisine = 'Karachi' where id = '0b8985fa-4507-5f65-8e07-379dc365e951'; -- Pakora
update public.recipes set cuisine = 'Punjabi' where id = 'b90e2177-f882-5e5f-8a8c-220e54b01988'; -- Sweet Lassi
update public.recipes set cuisine = 'Punjabi' where id = '499a0e0d-8130-599a-a846-b6a365136fc8'; -- Jalebi

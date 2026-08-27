# Catalog images

Drop source photos here to give a food or recipe a real picture instead of its
emoji placeholder:

- `foods/{key}.jpg` (or `.jpeg`/`.png`/`.webp`) — `{key}` must match a `key`
  field in `../foods.json`.
- `recipes/{key}.jpg` — same, matching a `key` in `../recipes.json`.

Then run, from `scripts/`:

```
npm install        # first time only
npm run upload-images
npm run generate-seed
```

`upload-images` resizes/compresses each source photo and uploads it to the
`catalog-images` Supabase Storage bucket at a path derived from the food/
recipe's id. `generate-seed` regenerates `supabase/seed.sql`, filling in
`image_url` for any key that now has a photo and leaving everything else
`null`. Apply the regenerated `seed.sql` in the Supabase SQL editor as usual.

Re-running `upload-images` after swapping in a better photo for the same key
is safe — uploads always overwrite.

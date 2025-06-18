ALTER TABLE uploaded_files
ADD COLUMN IF NOT EXISTS column_headers JSONB,
ADD COLUMN IF NOT EXISTS row_count INTEGER;

COMMENT ON COLUMN uploaded_files.column_headers IS 'JSON array of column header strings from the CSV';
COMMENT ON COLUMN uploaded_files.row_count IS 'Number of data rows in the CSV (excluding header)';

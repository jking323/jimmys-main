-- Correct the seed pin to Plus Code 39H5+J7 (West Melbourne, FL).
-- The original 0005 seed was ~800m south of the actual lounge.
-- Only updates if the row still matches the original seed values, so
-- any hand-edits made via the admin portal are preserved.

UPDATE business_location
SET lat = 28.0791, lng = -80.6418, updated_at = datetime('now')
WHERE id = 1
  AND lat = 28.0668
  AND lng = -80.6520;

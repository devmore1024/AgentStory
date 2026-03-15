BEGIN;

UPDATE story_books
SET cover_image = '/covers/' || slug
WHERE cover_image IS NULL
   OR cover_image = '';

COMMIT;

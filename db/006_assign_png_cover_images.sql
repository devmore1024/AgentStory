UPDATE story_books
SET cover_image = '/images/covers/' || slug || '.png'
WHERE is_active = TRUE;

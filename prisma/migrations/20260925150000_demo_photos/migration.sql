-- Demo listings now use stock photos under /demo/photos/ instead of the old illustrations.
-- A new path is used because /demo/* is served with a one-year immutable cache.
UPDATE "PropertyImage"
SET "url" = regexp_replace("url", '^/demo/([a-z]+-[0-9]+\.webp)$', '/demo/photos/\1'),
    "alt" = replace("alt", '(sample illustration)', '(sample photo)')
WHERE "url" ~ '^/demo/[a-z]+-[0-9]+\.webp$';

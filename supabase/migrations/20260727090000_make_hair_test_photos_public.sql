-- Make hair-test-photos public so the uploaded photo URL can be shared
-- directly inside the WhatsApp handoff message, matching skin-test-photos.
-- Object paths are randomised (record id + timestamp), so files are not
-- guessable or listable, but anyone with the exact link can view that photo.

update storage.buckets
set public = true
where id = 'hair-test-photos';

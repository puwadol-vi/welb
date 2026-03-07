SELECT setval(
  pg_get_serial_sequence('spots', 'id'),
  COALESCE((SELECT MAX(id) FROM spots), 1)
);

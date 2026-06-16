update public.clinic_admin_state
set payload = jsonb_set(
  coalesce(payload, '{}'::jsonb),
  '{pharmacySales}',
  coalesce(
    (
      select jsonb_agg(sale.invoice)
      from jsonb_array_elements(coalesce(payload->'pharmacySales', '[]'::jsonb)) as sale(invoice)
      where sale.invoice->>'invoiceNo' not in (
        '20260030004',
        '20260030003',
        '20260030002',
        '20260030001'
      )
    ),
    '[]'::jsonb
  ),
  true
)
where id = 'primary'
  and exists (
    select 1
    from jsonb_array_elements(coalesce(payload->'pharmacySales', '[]'::jsonb)) as sale(invoice)
    where sale.invoice->>'invoiceNo' in (
      '20260030004',
      '20260030003',
      '20260030002',
      '20260030001'
    )
  );

-- First pull for a Subject Access Request: every document and chunk in one
-- org that mentions a person. Review by hand afterwards: it misses spelling
-- variants and anything not in the uploaded text.
select d.id as document_id, d.title, c.chunk_index, c.content
from documents d
join chunks c on c.document_id = d.id
where d.org_id = $1
  and c.content ilike '%' || $2 || '%'
order by d.title, c.chunk_index;

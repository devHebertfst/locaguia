-- Bucket das fotos dos equipamentos no Supabase Storage. Leitura pública (o
-- catálogo monta a URL direto); escrita só pelo servidor, com a chave
-- secreta, por link assinado. Sem policies em storage.objects: o navegador não
-- grava nada com a chave pública.
-- O painel envia WebP (ou JPEG no Safari antigo) já reduzido a 1600 px.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('equipamentos', 'equipamentos', true, 5242880, ARRAY['image/webp', 'image/jpeg'])
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

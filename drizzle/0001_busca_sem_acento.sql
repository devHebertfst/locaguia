-- Busca do catálogo sem diferenciar acentos ("betoneira" acha "Betoneira",
-- "serra marmore" acha "Serra mármore").
CREATE SCHEMA IF NOT EXISTS extensions;--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA extensions;--> statement-breakpoint
-- unaccent() não é IMMUTABLE; o wrapper com dicionário fixo é, e pode ser
-- usado em índices se a busca precisar ficar mais rápida.
CREATE OR REPLACE FUNCTION public.sem_acento(texto text)
RETURNS text
LANGUAGE sql
IMMUTABLE PARALLEL SAFE STRICT
SET search_path = ''
AS $$ SELECT lower(extensions.unaccent('extensions.unaccent'::regdictionary, texto)) $$;

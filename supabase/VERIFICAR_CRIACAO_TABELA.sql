-- Script para verificar permissão de criação de tabelas
-- Copie este conteúdo e execute no SQL Editor do Supabase (https://supabase.com/dashboard/project/bpqdwsvrggixgdmboftr/sql/new)

CREATE TABLE IF NOT EXISTS public.trae_verificacao (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mensagem TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir um dado de teste
INSERT INTO public.trae_verificacao (mensagem) 
VALUES ('Trae conseguiu gerar o script de criação com sucesso!')
ON CONFLICT DO NOTHING;

-- Ler os dados para confirmar
SELECT * FROM public.trae_verificacao;

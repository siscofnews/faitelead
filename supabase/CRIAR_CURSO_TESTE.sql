-- CRIAR CURSO DIRETO NO BANCO PARA TESTAR

INSERT INTO public.courses (title, description, monthly_price, is_active)
VALUES (
  'Curso Teste FAITEL',
  'Curso criado direto no banco para testar',
  50.00,
  true
);

-- Ver se foi criado
SELECT * FROM public.courses;

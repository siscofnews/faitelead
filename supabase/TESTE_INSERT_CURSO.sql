-- CRIAR CURSO TESTE DIRETO NO BANCO

INSERT INTO public.courses (
  title, 
  description, 
  monthly_price, 
  is_active,
  duration_months,
  total_hours
)
VALUES (
  'CURSO TESTE DIRETO SQL',
  'Teste para verificar se banco aceita insert',
  100.00,
  true,
  12,
  360
);

-- Verificar se foi criado
SELECT * FROM public.courses;

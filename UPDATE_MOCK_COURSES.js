// Script para adicionar imagens aos cursos mock
// Execute este código no Console do navegador (F12)

// 1. Limpar cursos antigos
localStorage.removeItem('demo_courses');

// 2. Criar cursos com suas imagens
const coursosComImagens = [
    {
        id: "mock-1",
        title: "Teologia Básica",
        description: "CURSO BÁSICO EM TEOLOGIA - FAITEL Faculdade Internacional...",
        thumbnail_url: "/path/to/your/image1.jpg", // ← COLE AQUI O CAMINHO DA SUA IMAGEM
        duration_months: 14,
        total_hours: 1560,
        monthly_price: 40,
        modality: "EAD",
        mec_rating: null,
        is_active: true,
        created_at: new Date().toISOString(),
        modules_count: 0,
        students_count: 0,
    },
    {
        id: "mock-2",
        title: "Teologia Sistemática",
        description: "Estudo aprofundado das doutrinas",
        thumbnail_url: "/path/to/your/image2.jpg", // ← COLE AQUI O CAMINHO DA SUA IMAGEM
        duration_months: 18,
        total_hours: 540,
        monthly_price: 120,
        modality: "EAD",
        mec_rating: null,
        is_active: true,
        created_at: new Date().toISOString(),
        modules_count: 0,
        students_count: 0,
    },
    {
        id: "mock-3",
        title: "Bibliologia Avançada",
        description: "Estudo detalhado das Escrituras",
        thumbnail_url: "/path/to/your/image3.jpg", // ← COLE AQUI O CAMINHO DA SUA IMAGEM
        duration_months: 14,
        total_hours: 420,
        monthly_price: 110,
        modality: "EAD",
        mec_rating: null,
        is_active: true,
        created_at: new Date().toISOString(),
        modules_count: 0,
        students_count: 0,
    },
];

// 3. Salvar no localStorage
localStorage.setItem('demo_courses', JSON.stringify(coursosComImagens));

// 4. Recarregar a página
location.reload();

console.log('✅ Cursos atualizados com imagens! A página será recarregada...');

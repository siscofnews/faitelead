// Mock de cursos para desenvolvimento
export const MOCK_COURSES = [
    {
        id: "1",
        title: "Curso de Teologia Básica",
        description: "Introdução aos estudos teológicos com material didático completo",
        monthly_price: 99.00,
        is_active: true,
        duration_months: 12,
        workload_hours: 360,
        level: "EAD",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: "2",
        title: "Teologia Sistemática",
        description: "Estudo aprofundado das doutrinas cristãs fundamentais",
        monthly_price: 120.00,
        is_active: true,
        duration_months: 18,
        workload_hours: 540,
        level: "EAD",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: "3",
        title: "Bibliologia Avançada",
        description: "Estudo detalhado das Escrituras Sagradas",
        monthly_price: 110.00,
        is_active: true,
        duration_months: 14,
        workload_hours: 420,
        level: "EAD",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
];

export function getCoursesFromLocalStorage() {
    const stored = localStorage.getItem("mock_courses");
    if (stored) {
        return JSON.parse(stored);
    }
    // Inicializar com cursos padrão
    localStorage.setItem("mock_courses", JSON.stringify(MOCK_COURSES));
    return MOCK_COURSES;
}

export function saveCourseToLocalStorage(course: any) {
    const courses = getCoursesFromLocalStorage();
    const newCourse = {
        ...course,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
    courses.push(newCourse);
    localStorage.setItem("mock_courses", JSON.stringify(courses));
    return newCourse;
}

export function deleteCourseFromLocalStorage(courseId: string) {
    const courses = getCoursesFromLocalStorage();
    const filtered = courses.filter((c: any) => c.id !== courseId);
    localStorage.setItem("mock_courses", JSON.stringify(filtered));
}

export function updateCourseInLocalStorage(courseId: string, updates: any) {
    const courses = getCoursesFromLocalStorage();
    const index = courses.findIndex((c: any) => c.id === courseId);
    if (index !== -1) {
        courses[index] = {
            ...courses[index],
            ...updates,
            updated_at: new Date().toISOString(),
        };
        localStorage.setItem("mock_courses", JSON.stringify(courses));
        return courses[index];
    }
    return null;
}

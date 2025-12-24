// Funções helper para gerenciar cursos MOCK no localStorage

export function getMockCourses() {
    const stored = localStorage.getItem("demo_courses");
    if (stored) {
        return JSON.parse(stored);
    }
    // Cursos padrão se não existir
    const defaultCourses = [
        {
            id: "mock-1",
            title: "Teologia Básica",
            description: "Curso introdutório de teologia",
            thumbnail_url: null,
            duration_months: 12,
            total_hours: 360,
            monthly_price: 99,
            modality: "ead",
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
            thumbnail_url: null,
            duration_months: 18,
            total_hours: 540,
            monthly_price: 120,
            modality: "ead",
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
            thumbnail_url: null,
            duration_months: 14,
            total_hours: 420,
            monthly_price: 110,
            modality: "ead",
            mec_rating: null,
            is_active: true,
            created_at: new Date().toISOString(),
            modules_count: 0,
            students_count: 0,
        },
    ];
    localStorage.setItem("demo_courses", JSON.stringify(defaultCourses));
    return defaultCourses;
}

export function saveMockCourses(courses: any[]) {
    localStorage.setItem("demo_courses", JSON.stringify(courses));
}

export function addMockCourse(courseData: any) {
    const courses = getMockCourses();
    const newCourse = {
        ...courseData,
        id: `mock-${Date.now()}`,
        created_at: new Date().toISOString(),
        modules_count: 0,
        students_count: 0,
        is_active: true,
    };
    courses.push(newCourse);
    saveMockCourses(courses);
    return newCourse;
}

export function updateMockCourse(courseId: string, updates: any) {
    const courses = getMockCourses();
    const index = courses.findIndex((c: any) => c.id === courseId);
    if (index !== -1) {
        courses[index] = { ...courses[index], ...updates };
        saveMockCourses(courses);
        return courses[index];
    }
    return null;
}

export function deleteMockCourse(courseId: string) {
    const courses = getMockCourses();
    const filtered = courses.filter((c: any) => c.id !== courseId);
    saveMockCourses(filtered);
    return true;
}

export function isMockCourse(courseId: string) {
    return courseId.startsWith("mock-");
}

// Módulos mock
export function getMockModules(courseId: string) {
    const key = `demo_modules_${courseId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
}

export function saveMockModules(courseId: string, modules: any[]) {
    const key = `demo_modules_${courseId}`;
    localStorage.setItem(key, JSON.stringify(modules));
}

export function addMockModule(courseId: string, moduleData: any) {
    const modules = getMockModules(courseId);
    const newModule = {
        ...moduleData,
        id: `mock-module-${Date.now()}`,
        course_id: courseId,
        created_at: new Date().toISOString(),
    };
    modules.push(newModule);
    saveMockModules(courseId, modules);
    return newModule;
}

// Aulas mock
export function getMockLessons(moduleId: string) {
    const key = `demo_lessons_${moduleId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
}

export function saveMockLessons(moduleId: string, lessons: any[]) {
    const key = `demo_lessons_${moduleId}`;
    localStorage.setItem(key, JSON.stringify(lessons));
}

export function addMockLesson(moduleId: string, lessonData: any) {
    const lessons = getMockLessons(moduleId);
    const newLesson = {
        ...lessonData,
        id: `mock-lesson-${Date.now()}`,
        module_id: moduleId,
        created_at: new Date().toISOString(),
    };
    lessons.push(newLesson);
    saveMockLessons(moduleId, lessons);
    return newLesson;
}

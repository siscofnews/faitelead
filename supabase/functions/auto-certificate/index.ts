import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function generateCertificateNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
  return `FAITEL-${year}-${random}`
}

function generateQRCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { student_id, course_id } = await req.json()

    if (!student_id || !course_id) {
      return new Response(
        JSON.stringify({ error: 'student_id and course_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Checking certificate eligibility for student ${student_id} in course ${course_id}`)

    // Check if certificate already exists
    const { data: existingCert } = await supabase
      .from('issued_certificates')
      .select('id')
      .eq('student_id', student_id)
      .eq('course_id', course_id)
      .single()

    if (existingCert) {
      console.log('Certificate already exists')
      return new Response(
        JSON.stringify({ message: 'Certificate already issued', certificate_id: existingCert.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get course details
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title, total_hours')
      .eq('id', course_id)
      .single()

    if (courseError || !course) {
      console.error('Course not found:', courseError)
      return new Response(
        JSON.stringify({ error: 'Course not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get all modules for this course
    const { data: modules } = await supabase
      .from('modules')
      .select('id')
      .eq('course_id', course_id)

    if (!modules || modules.length === 0) {
      console.log('No modules found for course')
      return new Response(
        JSON.stringify({ error: 'No modules found for course' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const moduleIds = modules.map(m => m.id)

    // Get all lessons for these modules
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id')
      .in('module_id', moduleIds)

    if (!lessons || lessons.length === 0) {
      console.log('No lessons found for course')
      return new Response(
        JSON.stringify({ error: 'No lessons found for course' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const lessonIds = lessons.map(l => l.id)

    // Get completed lessons for this student
    const { data: completedLessons } = await supabase
      .from('lesson_progress')
      .select('lesson_id')
      .eq('student_id', student_id)
      .eq('completed', true)
      .in('lesson_id', lessonIds)

    const completedCount = completedLessons?.length || 0
    const totalLessons = lessons.length
    const progress = Math.round((completedCount / totalLessons) * 100)

    console.log(`Progress: ${progress}% (${completedCount}/${totalLessons} lessons)`)

    if (progress < 100) {
      return new Response(
        JSON.stringify({ 
          message: 'Course not yet completed', 
          progress,
          completed: completedCount,
          total: totalLessons
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get student profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', student_id)
      .single()

    if (profileError || !profile) {
      console.error('Profile not found:', profileError)
      return new Response(
        JSON.stringify({ error: 'Student profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate average grade from exam submissions
    const { data: examSubmissions } = await supabase
      .from('exam_submissions')
      .select('score, exam_id')
      .eq('student_id', student_id)
      .eq('passed', true)

    let averageGrade = 0
    if (examSubmissions && examSubmissions.length > 0) {
      // Get exams for this course's modules
      const { data: courseExams } = await supabase
        .from('exams')
        .select('id')
        .in('module_id', moduleIds)

      if (courseExams) {
        const courseExamIds = courseExams.map(e => e.id)
        const relevantSubmissions = examSubmissions.filter(s => courseExamIds.includes(s.exam_id))
        if (relevantSubmissions.length > 0) {
          averageGrade = relevantSubmissions.reduce((sum, s) => sum + s.score, 0) / relevantSubmissions.length
        }
      }
    }

    // Issue the certificate
    const certificateNumber = generateCertificateNumber()
    const qrCode = generateQRCode()

    const { data: newCertificate, error: certError } = await supabase
      .from('issued_certificates')
      .insert({
        student_id,
        course_id,
        student_name: profile.full_name,
        course_name: course.title,
        total_hours: course.total_hours || 540,
        grade: averageGrade > 0 ? averageGrade : null,
        certificate_number: certificateNumber,
        qr_verification_code: qrCode,
        certificate_type: 'completion'
      })
      .select()
      .single()

    if (certError) {
      console.error('Error issuing certificate:', certError)
      return new Response(
        JSON.stringify({ error: 'Failed to issue certificate' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Certificate issued successfully: ${certificateNumber}`)

    return new Response(
      JSON.stringify({ 
        message: 'Certificate issued successfully',
        certificate: newCertificate
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

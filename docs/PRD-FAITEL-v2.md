# PRD FINAL — FAITEL (Plataforma EAD Híbrida)

Versão: 2.0 — Documento em Português (formal)

Resumo: Documento de requisitos do Sistema Acadêmico e EAD — FAITEL, extraído e consolidado do PRD SISCOF original. Removido todo conteúdo referente a Igrejas e Convenções — este PRD é dedicado exclusivamente à plataforma EAD para faculdades e universidades (multi‑instituição / multi‑tenant / white‑label), com foco na oferta de cursos superiores, pós‑graduações, mestrado, doutorado, cursos profissionalizantes, EJA, psicanálise clínica pastoral, gestão de igrejas (curso acadêmico), direitos humanos e outros cursos de extensão.

## 1. Visão Geral do Produto

Nome: FAITEL — Plataforma Acadêmica Híbrida (EAD + suporte presencial)

Objetivo: Plataforma robusta, segura e escalável para gestão acadêmica e oferta EAD de múltiplos níveis (graduação → doutorado), pensada para operar como produto (SaaS / White‑label) e para uso institucional próprio.

Diferenciais:
- UX moderna
- Integração Stitch
- Suporte SCORM/xAPI
- Automações WhatsApp
- Certificação digital com QR
- Multi‑tenant
- Mobile‑first (PWA + apps)

Tema UI:
- Primário: Azul da Europa (ex.: `#0A4E8A`) — cabeçalhos, botões primários, links
- Secundário / Acento: Degradê vinho (ex.: `linear-gradient(120deg, #6D1B3D 0%, #8B2436 100%)`) — banners, cards de destaque, hover
- Acessibilidade: contrastes WCAG AA

## 2. Arquitetura de Níveis (Hierarquia Acadêmica)

- Super Admin Global (proprietário / vendedor do sistema / senha mestra / login mestre)
- Reitoria / Super Admin Acadêmico (administração da instituição)
- Faculdade Matriz (instituição contratante / cliente)
- Polos (Estaduais → Regionais)
- Professores / Coordenadores
- Alunos

Regras principais:
- Super Admin cria/cadastra Matrizes (faculdades/universidades) e gerencia planos, branding, logs e faturamento
- Matrizes podem criar e autorizar Polos Estaduais e Polos Regionais
- Diretores de Polo têm administração local (matrícula, upload de materiais, criação de turmas/provas)
- Permissões RBAC detalhadas por papel (ver seção Papéis)

## 3. Internacionalização & Locais

- Idiomas suportados: Português, Inglês, Espanhol, Francês
- Campos de documentos e formatos adaptáveis por país (data, CPF/CNPJ vs NIF, etc.)
- Localização (i18n) completa: textos, datas, moedas, formatos

## 4. Campos de Documentos — Padrão Internacional

Cada cadastro (aluno, professor, responsável) terá até 3 campos de documento:
- Tipo (ex.: Passaporte, CPF, NIF, DNI, SSN, Driver License, Outro)
- Número
- País emissor

Esses documentos suportam: geração de matrícula, credenciais, certificados, diplomas, históricos e verificação KYC básica.

## 5. Scope Funcional Principal (Módulos EAD)

### 5.1 Administração (Portal Administrativo / Reitoria)
- Gestão multi‑instituição (Matrizes, Polos, usuários)
- Gestão de Cursos, Programas, Módulos, Aulas, Provas e Banco de questões
- Upload/gestão de conteúdos: PDF, Word, PPT, vídeo (upload), incorporação de vídeo externo (YouTube/Vimeo), SCORM/xAPI
- Criação de cronogramas, calendário acadêmico, cargas horárias
- Gestão de turmas, vagas e listagens de espera
- Gestão financeira: mensalidades, cobranças, parciais, relatórios e integrações de pagamento
- Emissão de documentos: histórico acadêmico, certificados, diplomas (PDF com assinatura digital e QR)
- Relatórios customizáveis (retenção, desempenho, inadimplência, faturamento)
- Configuração de modelos de certificado por Matriz
- Configuração de regras de comissionamento / repasse para Polos
- Painel de logs e auditoria

### 5.2 Portal do Professor / Coordenador
- Criar/editar aulas, materiais e atividades
- Upload em lote e versionamento de conteúdo
- Fórum e comunicação com turmas, envio de avisos (e‑mail / WhatsApp)
- Montagem e aplicação de avaliações; correção manual e automática; rubricas
- Lançamento de notas, frequências e emissão de relatórios de turma
- Avaliação por competências e rubricas customizáveis
- Integração com videoconferência (Zoom / Jitsi / BigBlueButton)

### 5.3 Portal do Aluno
- Cadastro / matrícula / KYC (até 3 documentos)
- Dashboard de progresso (barra, módulos completos)
- Acesso a materiais (PDF), player para vídeos internos e externos
- Realização de provas (tempo, tentativas, segurança)
- Área financeira: pagamentos (Pix/Boleto/Cartão), recibos, parcelamento
- Download de certificados; acesso a histórico e credencial (PDF + QR)
- Fórum por turma, chat e agendamento de mentorias
- Notificações push / email / WhatsApp (automação)

### 5.4 Gestão de Polos (Portal do Polo / Diretor)
- Criar turmas locais, matricular alunos, subir materiais locais
- Emitir documentos locais, relatórios e enviar informações para Reitoria
- Controle de atendimentos e indicadores do polo
- Modo offline / sync (para áreas com baixa conectividade) — sincronização de conteúdo e envios

### 5.5 Conteúdos e Avaliações Avançadas
- Suporte SCORM 1.2 / 2004 e xAPI
- Banco de questões categorizado; geração aleatória de provas
- Provas com temporizador, tentativas, correção automática; prova com antiplágio (integração opcional)
- Proctoring opcional (webcam + AI / serviços externos)
- Geração automática de certificados e históricos ao atingir critérios

### 5.6 Financeiro & Comercial
- Modelos de cobrança: assinatura institucional, mensalidade por aluno, curso avulso, marketplace
- Gateways: Stripe, PayPal, PagSeguro, Pix e integrações locais
- Relatórios de faturamento por Matriz / Polo / Curso
- Integração contábil/export CSV para ERPs

## 6. Documentos e Identidade (EAD)
- Credencial de Aluno: PDF com foto, número de matrícula e QR verificável
- Histórico Acadêmico: carga horária, módulos cursados, notas, progresso
- Certificados digitais: conclusão, extensão, capacitação — PDF + QR + assinatura digital
- Diplomas: modelos assinados digitalmente, configuráveis por Matriz

## 7. Acesso e Segurança
- Conformidade: LGPD / GDPR readiness
- Criptografia: TLS 1.3 em trânsito, AES‑256 em repouso
- Autenticação: senha + 2FA, suporte SSO (SAML / OpenID Connect)
- Logs completos: data, hora, IP, ação; retenção configurável
- RBAC + ABAC: papéis e regras contextuais (ex.: região, polo, curso)
- Backups & DR: snapshots automáticos, replicação multi‑região
- Segurança de provas: lockdown browser e opção de proctoring

Papéis principais:
- Super Admin Global
- Super Admin Acadêmico (Reitoria)
- Admin da Matriz (Faculdade)
- Diretor de Polo (Estadual / Regional)
- Professor / Coordenador
- Aluno
- Financeiro / Suporte

## 8. Adaptação ao Stitch — Workspaces e Componentes

Workspaces recomendados (Stitch):
- FAITEL — Admin (`/ead/admin`)
- FAITEL — Professor (`/ead/prof`)
- FAITEL — Aluno (`/ead/aluno`)
- FAITEL — Polos (`/ead/polos`)
- Super Admin Global (`/superadmin`)

Componentes Stitch recomendados:
- Forms: multi‑step, validação, upload manager
- Tabelas: filtros, ordenação, ações em massa
- Dashboard: cards, widgets, graphs
- Flows: automação WhatsApp, geração de PDF, integrações de pagamento
- Media Player e preview de documentos

## 9. Fluxos Essenciais (User Flows)

### 9.1 Fluxo criação de curso (Admin)
Super Admin / Admin Matriz → Criar curso → Definir módulos → Inserir aulas (PDF / vídeo / SCORM) → Configurar avaliações → Publicar → Abrir inscrições.

### 9.2 Fluxo matrícula (Aluno)
Aluno → Cadastro (KYC até 3 documentos) → Pagamento → Matrícula confirmada → Acesso ao curso → Progresso → Emissão certificado.

### 9.3 Fluxo provas e notas
Professor cria prova → define banco de questões → aplica prova → correção automática/manual → nota lançada → histórico atualizado → certificado liberado (se aplicável).

### 9.4 Fluxo de provisionamento (Super Admin → Matriz → Polo)
Super Admin cria Matriz → Matriz cria Polo Estadual → Polo cria Polo Regional → Diretor recebe credenciais → Diretor cria turmas e inicia matrículas.

## 10. Requisitos Não‑Funcionais
- Escalabilidade: arquitetura baseada em microservices e Kubernetes; multi‑tenant isolado por schema/tenant
- Disponibilidade: target SLA 99.9% (dependerá do plano)
- Performance: latência APIs principais <200ms (quando em região apropriada)
- Compatibilidade: Web (Chrome, Edge, Safari), iOS, Android, PWA
- Backups: diários, testes de restore trimestrais
- Observabilidade: métricas (Prometheus), logging centralizado e alertas (Grafana)
- Internacionalização: formatos de data, moeda, texto e localmente relevantes

## 11. Cursos e Programação — Oferta Inicial (exemplos)
- Formação Superior: Bacharelado em Teologia; Licenciaturas conforme estratégia
- Pós‑Graduação (Lato Sensu): Gestão Pastoral, Psicanálise Clínica Pastoral, Gestão de Igrejas, Direitos Humanos Aplicados
- Mestrado e Doutorado (Stricto Sensu): Mestrado em Teologia; Doutorado em Teologia (suporte administrativo e acadêmico para programas stricto)
- Cursos Profissionalizantes: Gestão de Organizações Religiosas, Formação Ministerial, Psicanálise Clínica Pastoral (nível técnico)
- EJA: Conclusão do Ensino Fundamental e Ensino Médio (itinerários flexíveis)
- Cursos Livres / Extensão: Direitos Humanos, Mediação, Aconselhamento, Workshops

Observação: A infraestrutura do sistema suporta qualquer grade e nível; reconhecimento legal e credenciamento dependem de órgãos reguladores.

## 12. Planos Comerciais & Monetização
- Modelos: Starter, Growth, Enterprise, White‑Label
- Recursos por plano: número de alunos, polos, storage mídia, SLA, personalização de marca
- Tarifação adicional: transcodificação de vídeo, proctoring, integrações SSO, suporte premium
- Possibilidade de trial/demo e instância sandbox para prospects

## 13. Roadmap (Alto Nível)
- MVP (0–3 meses): autenticação (3 logins), cadastro Matriz→Polo, criação de cursos simples, upload PDF/vídeo externo, matrícula/pagamento básico, emissão de certificados PDF com QR, UI tema azul/vinho
- v1 (3–6 meses): SCORM/xAPI, banco de questões, provas online, mobile PWA, relatórios iniciais
- v2 (6–12 meses): white‑label completo, SSO, analytics avançado, proctoring, IA de recomendação
- v3 (12+ meses): marketplace de cursos, integrações ERPs, suporte à gestão de pesquisa (tese, banca)

## 14. KPIs (Sugeridos)
- Conversão inscrição → matrícula
- Taxa de conclusão por curso
- Retenção 30/60/90 dias
- ARPU (receita média por aluno)
- Tempo médio de resposta do suporte
- Taxa de inadimplência

## 15. Entregáveis para Implementação
- OpenAPI spec (documentação de APIs)
- ER diagram / schema multi‑tenant
- Wireframes high‑fi (tema Azul + Vinho) e protótipos Stitch/Figma
- Plano de migração (CSV/ETL)
- Plano de testes (unit, integração, segurança, UAT)
- Runbooks (deploy, backups, DR) e scripts (terraform/helm)

## 16. Regras Operacionais & Observações
- Senha mestra / login mestre: Super Admin deverá usar MFA (recomenda‑se hardware token) e política de rotação. Registrar todas as ações de provisionamento em audit logs
- Acreditação: o sistema suporta oferta de mestrado/doutorado, mas reconhecimento legal é responsabilidade da instituição (processos junto aos órgãos competentes)
- Branding / White‑label: cada Matriz pode customizar logo, cores secundárias e modelos de certificado (limitado pelo plano contratado)
- Privacidade: políticas de consentimento para EAD (uso de dados, gravação de aulas, proctoring)

## 17. Mapa de Navegação (Full Navigation Map — EAD)
```
ROOT
├── /login
├── /register
├── /forgot-password
├── /select-system (FAITEL — EAD)
├── /ead/home
│ ├── /ead/admin/dashboard
│ │ ├── /ead/admin/alunos
│ │ │ ├── /lista
│ │ │ ├── /cadastro
│ │ │ └── /detalhes/{id}
│ │ ├── /ead/admin/professores
│ │ ├── /ead/admin/cursos
│ │ │ ├── /lista
│ │ │ ├── /cadastro
│ │ │ └── /detalhes/{id}
│ │ ├── /ead/admin/polos
│ │ ├── /ead/admin/financeiro
│ │ └── /ead/admin/relatorios
│ ├── /ead/prof/dashboard
│ │ ├── /turmas
│ │ ├── /aulas/upload
│ │ ├── /notas
│ │ └── /forum
│ └── /ead/aluno/dashboard
│ ├── /meus-cursos
│ ├── /aulas/{curso}/{modulo}
│ ├── /provas/{curso}/{modulo}
│ ├── /boletim
│ ├── /financeiro
│ └── /certificados
└── /superadmin/dashboard
  ├── /superadmin/geral (Matrizes / Polos / usuários / branding)
  ├── /superadmin/financeiro
  └── /superadmin/config
```

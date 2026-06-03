import { useSystemStore } from "../stores/useSystemStore";

export const translations = {
  en: {
    // Navigation / Modules
    "dashboard": "Dashboard",
    "communication": "Communication",
    "copilot": "Copilot",
    "daily-logs-management": "Daily Logs",
    "document-management": "Documents",
    "employee-management": "Employees",
    "integrations": "Integrations",
    "issue-reporting": "Issue Reporting",
    "notifications": "Notifications",
    "permission-management": "Permissions",
    "project-oversight": "Project Oversight",
    "risk-management": "Risk Management",
    "role-management": "Role Management",
    "schedule-management": "Schedule",
    "system-logs": "System Logs",
    "task-management": "Tasks",
    "user-management": "Users",
    "workforce-management": "Workforce",

    // Login
    "login_title": "Sign In",
    "login_subtitle": "Access your construction workspace",
    "email_label": "Email Address",
    "password_label": "Password",
    "signin_btn": "Sign In",
    "signingin_btn": "Signing In...",
    "welcome_back": "Welcome back!",
    "login_error": "Invalid email or password",
    "login_desc": "ONE-365 is your all-in-one solution for managing construction projects efficiently. From daily logs to workforce management, we provide the tools you need to streamline operations and enhance productivity.",

    // TopNav / UI
    "logout": "Logout",
    "light_mode": "Light Mode",
    "dark_mode": "Dark Mode",
    "no_unread_notif": "No unread notifications",
    "view_all_notif": "View all notifications",
    "notif_title": "Notifications",
    "signin_prompt_notif": "Sign in to see notifications",
    "theme": "Theme",
    "language": "Language",

    // Home Landing Page
    "home_nav_home": "Home",
    "home_nav_solutions": "Solutions",
    "home_nav_product": "Product",
    "home_nav_support": "Support",
    "home_title": "Welcome to ONE-365",
    "home_subtitle": "CONSTRUCTION PROJECT MANAGEMENT SOFTWARE",
    "home_hero_shaping": "Shaping your vision",
    "home_hero_precision": "With Precision",
    "home_request_demo": "Request a Demo",
    "home_get_mobile": "Get Mobile App",
    "home_best_building": "The best in building own their success with ONE-365",
    
    // Feature Card Descriptions
    "employee_mgmt_desc": "Manage your workforce efficiently and track employee progress.",
    "schedule_mgmt_desc": "Plan, assign, and monitor project schedules in real time.",
    "project_oversight_desc": "Gain insights and control over all ongoing projects.",
    "workforce_mgmt_desc": "Optimize labor allocation and productivity on site.",
    "document_mgmt_desc": "Centralize and secure all your project documents.",

    // Sections
    "home_comm_label": "COMMUNICATION",
    "home_comm_title": "Close the communication loop.",
    "home_comm_desc": "Mobile collaboration tools are built for the site, making it easy for everyone to have a clear understanding of what needs to get done every day to stay on schedule and prevent rework.",
    
    "home_access_label": "ACCESS",
    "home_access_title": "Keep information accurate.",
    "home_access_desc": "Trust that all stakeholders have access to the latest information in a centralised location, and in a format that everyone can understand. Information is updated instantly so all stakeholders have ultimate visibility. Mitigate risks with accurate data logs.",

    "home_visibility_label": "VISIBILITY",
    "home_visibility_title": "Stay ahead of your projects.",
    "home_visibility_desc": "Quickly identify potential issues and their impact to schedule and budgets. Avoid unwanted surprises with better project visibility. Project overview gives a complete picture of any outstanding items. Track all steps and speed up the approval process.",

    "home_pm_cta": "See how Project Management can work for your team.",
    
    // Demo Modal Form
    "modal_demo_title": "Unlock our product demo",
    "modal_first_name": "First Name",
    "modal_last_name": "Last Name",
    "modal_phone_placeholder": "(555) 555-5555",
    "modal_company_placeholder": "Company *",
    "modal_email_placeholder": "Email *",
    "modal_country": "Country",
    "modal_country_select": "Select",
    "modal_builder_type": "Which builder type best describes your business?",
    "modal_builder_select": "Select",
    "modal_builder_residential": "Residential",
    "modal_builder_commercial": "Commercial",
    "modal_builder_industrial": "Industrial",
    "modal_revenue": "What is your average annual revenue?",
    "modal_revenue_select": "Select",
    "modal_revenue_1": "Under $1M",
    "modal_revenue_2": "$1M - $5M",
    "modal_revenue_3": "$5M - $20M",
    "modal_revenue_4": "Over $20M",
    "modal_submit_btn": "Unlock Demo",

    // Thank You Modal
    "thank_you_title": "Thank you!",
    "thank_you_desc": "A ONE-365 member will contact you to schedule the product demo.",
    "thank_you_home_btn": "Go to Home",

    // Footer
    "footer_contact": "Contact",
    "footer_privacy": "Privacy Policy",
    "footer_terms": "Terms of Service",

    // AI Copilot
    "copilot_title": "ONE-365 AI Copilot",
    "copilot_subtitle": "Your construction project intelligence assistant",
    "copilot_welcome": "How can I help you today?",
    "copilot_suggest_title": "Suggested Questions",
    "copilot_suggest_1": "Show me all unresolved issues in this project",
    "copilot_suggest_2": "Study the July 9th daily log and prepare a report",
    "copilot_suggest_3": "Give me a summary of employee attendance in July",
    "copilot_suggest_4": "Summarize communication threads for this project",
    "copilot_input_placeholder": "Ask me about documents, draft responses, search information, or get project insights...",
    "copilot_send": "Send",
    "copilot_thinking": "Copilot is thinking...",
    "copilot_upload_doc": "Upload Document",
    "copilot_past_chat": "Reference Past Chat",
    "copilot_find_docs": "Find Documents",
    "copilot_draft_resp": "Draft Response",
    "copilot_search_proj": "Search Project",
    "copilot_gen_report": "Generate Report",
    "copilot_no_project_access": "It looks like you don't have access to any projects yet. Please contact your administrator to get assigned to a project, or create a new project to start using ONE-365 Copilot.",
    "copilot_select_project_warn": "Please select a project from the dropdown above to get project-specific insights and assistance.",
    "copilot_wait_loading": "Loading project data... Please wait a moment for the most up-to-date information.",
    "copilot_gather_info": "Please wait while I gather the latest project information...",
    "copilot_welcome_title": "Welcome to ONE-365 Copilot",
    "copilot_loading_projects": "Loading projects...",
    "copilot_no_projects": "No projects available",
    "copilot_select_project": "Please select a project",
    "copilot_no_projects_assigned": "No projects assigned",
    "copilot_loading_project_data": "Loading project data...",

    // Common Actions / Status / Priorities
    "save": "Save",
    "cancel": "Cancel",
    "close": "Close",
    "add": "Add",
    "edit": "Edit",
    "delete": "Delete",
    "open": "Open",
    "closed": "Closed",
    "resolved": "Resolved",
    "high": "High",
    "medium": "Medium",
    "low": "Low",
    "critical": "Critical",
  },
  es: {
    // Navigation / Modules
    "dashboard": "Panel de Control",
    "communication": "Comunicación",
    "copilot": "Copiloto",
    "daily-logs-management": "Diarios de Obra",
    "document-management": "Documentos",
    "employee-management": "Empleados",
    "integrations": "Integraciones",
    "issue-reporting": "Incidencias",
    "notifications": "Notificaciones",
    "permission-management": "Permisos",
    "project-oversight": "Proyectos",
    "risk-management": "Riesgos",
    "role-management": "Roles",
    "schedule-management": "Cronograma",
    "system-logs": "Registros del Sistema",
    "task-management": "Tareas",
    "user-management": "Usuarios",
    "workforce-management": "Personal de Obra",

    // Login
    "login_title": "Iniciar Sesión",
    "login_subtitle": "Accede a tu espacio de trabajo de construcción",
    "email_label": "Dirección de Correo",
    "password_label": "Contraseña",
    "signin_btn": "Iniciar Sesión",
    "signingin_btn": "Iniciando Sesión...",
    "welcome_back": "¡Bienvenido de nuevo!",
    "login_error": "Correo o contraseña incorrectos",
    "login_desc": "ONE-365 es su solución todo en uno para gestionar proyectos de construcción de manera eficiente. Desde diarios de obra hasta la gestión de personal, proporcionamos las herramientas que necesita para optimizar las operaciones y mejorar la productividad.",

    // TopNav / UI
    "logout": "Cerrar Sesión",
    "light_mode": "Modo Claro",
    "dark_mode": "Modo Oscuro",
    "no_unread_notif": "No hay notificaciones sin leer",
    "view_all_notif": "Ver todas las notificaciones",
    "notif_title": "Notificaciones",
    "signin_prompt_notif": "Inicia sesión para ver notificaciones",
    "theme": "Tema",
    "language": "Idioma",

    // Home Landing Page
    "home_nav_home": "Inicio",
    "home_nav_solutions": "Soluciones",
    "home_nav_product": "Producto",
    "home_nav_support": "Soporte",
    "home_title": "Bienvenido a ONE-365",
    "home_subtitle": "SOFTWARE DE GESTIÓN DE PROYECTOS DE CONSTRUCCIÓN",
    "home_hero_shaping": "Dando forma a su visión",
    "home_hero_precision": "Con Precisión",
    "home_request_demo": "Solicitar Demostración",
    "home_get_mobile": "Obtener App Móvil",
    "home_best_building": "Los mejores en construcción construyen su éxito con ONE-365",
    
    // Feature Card Descriptions
    "employee_mgmt_desc": "Gestione su fuerza laboral de manera eficiente y realice un seguimiento del progreso de los empleados.",
    "schedule_mgmt_desc": "Planifique, asigne y controle los cronogramas del proyecto en tiempo real.",
    "project_oversight_desc": "Obtenga información y control sobre todos los proyectos en curso.",
    "workforce_mgmt_desc": "Optimice la asignación de mano de obra y la productividad en el sitio.",
    "document_mgmt_desc": "Centralice y proteja todos los documentos de su proyecto.",

    // Sections
    "home_comm_label": "COMUNICACIÓN",
    "home_comm_title": "Cierre el ciclo de comunicación.",
    "home_comm_desc": "Las herramientas de colaboración móvil están creadas para el sitio de obra, facilitando que todos tengan un entendimiento claro de lo que debe hacerse cada día para mantenerse en cronograma y evitar reprocesos.",
    
    "home_access_label": "ACCESO",
    "home_access_title": "Mantenga la información precisa.",
    "home_access_desc": "Confíe en que todos los interesados tienen acceso a la última información en una ubicación centralizada y en un formato que todos pueden comprender. La información se actualiza instantáneamente para que todos los interesados tengan máxima visibilidad. Mitigue riesgos con diarios de datos precisos.",

    "home_visibility_label": "VISIBILIDAD",
    "home_visibility_title": "Manténgase a la vanguardia de sus proyectos.",
    "home_visibility_desc": "Identifique rápidamente problemas potenciales y su impacto en el cronograma y presupuestos. Evite sorpresas no deseadas con una mejor visibilidad del proyecto. El resumen del proyecto proporciona una imagen completa de las tareas pendientes. Realice el seguimiento de todos los pasos y acelere el proceso de aprobación.",

    "home_pm_cta": "Vea cómo la Gestión de Proyectos puede funcionar para su equipo.",
    
    // Demo Modal Form
    "modal_demo_title": "Desbloquee nuestra demostración de producto",
    "modal_first_name": "Nombre",
    "modal_last_name": "Apellidos",
    "modal_phone_placeholder": "(555) 555-5555",
    "modal_company_placeholder": "Empresa *",
    "modal_email_placeholder": "Email *",
    "modal_country": "País",
    "modal_country_select": "Seleccionar",
    "modal_builder_type": "¿Qué tipo de constructor describe mejor su negocio?",
    "modal_builder_select": "Seleccionar",
    "modal_builder_residential": "Residencial",
    "modal_builder_commercial": "Comercial",
    "modal_builder_industrial": "Industrial",
    "modal_revenue": "¿Cuál es su ingreso promedio anual?",
    "modal_revenue_select": "Seleccionar",
    "modal_revenue_1": "Menos de $1M",
    "modal_revenue_2": "$1M - $5M",
    "modal_revenue_3": "$5M - $20M",
    "modal_revenue_4": "Más de $20M",
    "modal_submit_btn": "Desbloquear Demo",

    // Thank You Modal
    "thank_you_title": "¡Muchas gracias!",
    "thank_you_desc": "Un miembro de ONE-365 se pondrá en contacto con usted para programar la demostración del producto.",
    "thank_you_home_btn": "Ir al Inicio",

    // Footer
    "footer_contact": "Contacto",
    "footer_privacy": "Política de Privacidad",
    "footer_terms": "Términos de Servicio",

    // AI Copilot
    "copilot_title": "Copiloto IA de ONE-365",
    "copilot_subtitle": "Tu asistente de inteligencia para proyectos de construcción",
    "copilot_welcome": "¿Cómo te puedo ayudar hoy?",
    "copilot_suggest_title": "Preguntas Sugeridas",
    "copilot_suggest_1": "Muéstrame todos los problemas sin resolver en este proyecto",
    "copilot_suggest_2": "Estudia el registro diario del 9 de julio y prepara un informe",
    "copilot_suggest_3": "Dame un resumen de la asistencia de los empleados en julio",
    "copilot_suggest_4": "Resume los hilos de comunicación de este proyecto",
    "copilot_input_placeholder": "Pregúntame sobre documentos, redactar respuestas, buscar información o ver datos del proyecto...",
    "copilot_send": "Enviar",
    "copilot_thinking": "El copiloto está pensando...",
    "copilot_upload_doc": "Subir Documento",
    "copilot_past_chat": "Referenciar Chat Anterior",
    "copilot_find_docs": "Buscar Documentos",
    "copilot_draft_resp": "Redactar Respuesta",
    "copilot_search_proj": "Buscar en Proyecto",
    "copilot_gen_report": "Generar Informe",
    "copilot_no_project_access": "Parece que aún no tienes acceso a ningún proyecto. Comunícate con tu administrador para que te asigne uno, o crea un nuevo proyecto para comenzar a usar el Copiloto de ONE-365.",
    "copilot_select_project_warn": "Selecciona un proyecto del menú desplegable de arriba para obtener información y asistencia específicas de ese proyecto.",
    "copilot_wait_loading": "Cargando datos del proyecto... Espera un momento para obtener la información más actualizada.",
    "copilot_gather_info": "Espera un momento mientras recopilo la información más reciente del proyecto...",
    "copilot_welcome_title": "Bienvenido al Copiloto de ONE-365",
    "copilot_loading_projects": "Cargando proyectos...",
    "copilot_no_projects": "No hay proyectos disponibles",
    "copilot_select_project": "Selecciona un proyecto",
    "copilot_no_projects_assigned": "No hay proyectos asignados",
    "copilot_loading_project_data": "Cargando datos del proyecto...",

    // Common Actions / Status / Priorities
    "save": "Guardar",
    "cancel": "Cancelar",
    "close": "Cerrar",
    "add": "Agregar",
    "edit": "Editar",
    "delete": "Eliminar",
    "open": "Abierto",
    "closed": "Cerrado",
    "resolved": "Resuelto",
    "high": "Alta",
    "medium": "Media",
    "low": "Baja",
    "critical": "Crítica",
  }
};

export const useTranslation = () => {
  const language = useSystemStore((state) => state.language);
  const setLanguage = useSystemStore((state) => state.setLanguage);

  const t = (key: string, defaultValue?: string): string => {
    const dict = translations[language] || translations.en;
    return (dict as any)[key] || defaultValue || key;
  };

  return { t, language, setLanguage };
};

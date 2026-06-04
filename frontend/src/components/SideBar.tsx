import { useMemo, useState } from "react";
import type { Permission } from "../types/database";
import { useSystemStore } from "../stores/useSystemStore";
import { useTranslation } from "../hooks/useTranslation";

const NAV_GROUPS = [
  {
    id: "dashboard",
    labelKey: "nav_group_dashboard",
    label: "Dashboard",
    pages: ["dashboard"],
  },
  {
    id: "projects-team",
    labelKey: "nav_group_projects_team",
    label: "Proyectos y Equipo",
    pages: ["project-oversight", "employee-management", "workforce-management"],
  },
  {
    id: "field-operations",
    labelKey: "nav_group_field_operations",
    label: "Operación de Obra",
    pages: ["schedule-management", "daily-logs-management", "task-management"],
  },
  {
    id: "documents",
    labelKey: "nav_group_documents",
    label: "Documentos",
    pages: ["document-management"],
  },
  {
    id: "communication",
    labelKey: "nav_group_communication",
    label: "Comunicación",
    pages: ["communication", "notifications"],
  },
  {
    id: "quality-closeout",
    labelKey: "nav_group_quality_closeout",
    label: "Calidad y Cierre",
    pages: ["issue-reporting", "risk-management"],
  },
  {
    id: "administration",
    labelKey: "nav_group_administration",
    label: "Administración",
    pages: [
      "user-management",
      "role-management",
      "permission-management",
      "integrations",
      "system-logs",
      "copilot",
    ],
  },
];

// Sidebar Component
const Sidebar = ({
  permissions,
  activeRoute,
  onNavigate,
}: {
  permissions: Permission[];
  activeRoute: string;
  onNavigate: (path: string) => void;
}) => {
  const { t } = useTranslation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    dashboard: true,
    "projects-team": true,
    "field-operations": true,
    documents: true,
    communication: true,
    "quality-closeout": true,
    administration: false,
  });

  const accessiblePages = useMemo(
    () =>
      permissions
        .filter((p) => p.level === 1 || p.level === 2 || p.level === 3)
        .map((p) => ({
          page_id: p.permission.pageId,
          page_name: p.permission.pageName,
        })),
    [permissions]
  );

  const pageMap = useMemo(
    () => new Map(accessiblePages.map((page) => [page.page_id, page])),
    [accessiblePages]
  );
  const sidebarOpen = useSystemStore((s) => s.sidebarOpen);
  const setSidebarOpen = useSystemStore((s) => s.setSidebarOpen);

  const groupedPages = NAV_GROUPS.map((group) => ({
    ...group,
    pages: group.pages
      .map((pageId) => pageMap.get(pageId))
      .filter(Boolean) as { page_id: string; page_name: string }[],
  })).filter((group) => group.pages.length > 0);

  const toggleGroup = (groupId: string) => {
    setOpenGroups((current) => ({
      ...current,
      [groupId]: !current[groupId],
    }));
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-md bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed lg:relative lg:translate-x-0 top-0 left-0 h-full z-50 lg:z-auto
        ${sidebarOpen ? "w-64 min-w-64" : "lg:w-16"} 
        bg-base-200 border-r border-base-300 transition-all duration-200 flex flex-col`}
      >
        <div className="flex flex-col gap-2 px-4 py-4">
          {/* Logo: full when sidebar open, icon-only when collapsed */}
          {sidebarOpen ? (
            <span className="text-2xl font-extrabold tracking-tight select-none py-1">
              <span className="text-[#1c1c1c]">ONE</span>
              <span className="text-[#fdc700]">-365</span>
            </span>
          ) : (
            <span className="text-lg font-extrabold tracking-tight select-none text-center block py-1">
              <span className="text-[#fdc700]">O</span>
            </span>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto">
          <div className="menu p-2 w-full mt-2">
            {groupedPages.map((group) => {
              const groupIsActive = group.pages.some(
                (page) => activeRoute === `/${page.page_id}`
              );
              const isOpen = sidebarOpen && (openGroups[group.id] || groupIsActive);

              return (
                <div key={group.id} className="mb-1">
                  {sidebarOpen ? (
                    <button
                      type="button"
                      className={`flex w-full items-center justify-between rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wide ${
                        groupIsActive
                          ? "bg-primary/20 text-primary"
                          : "text-base-content/60 hover:bg-base-300"
                      }`}
                      onClick={() => toggleGroup(group.id)}
                    >
                      <span className="truncate">{t(group.labelKey, group.label)}</span>
                      <span className="text-base">{isOpen ? "−" : "+"}</span>
                    </button>
                  ) : null}

                  <ul className={`${isOpen || !sidebarOpen ? "block" : "hidden"}`}>
                    {group.pages.map((page) => (
                      <li key={page.page_id}>
                        <a
                          className={`flex text-base-content items-center gap-3 px-4 py-3 hover:bg-base-300 w-full rounded-lg ${
                            activeRoute === `/${page.page_id}` ? "bg-neutral-focus" : ""
                          }`}
                          title={t(page.page_id, page.page_name)}
                          onClick={() => {
                            onNavigate(`/${page.page_id}`);
                            if (window.innerWidth < 1024) {
                              setSidebarOpen(false);
                            }
                          }}
                        >
                          {sidebarOpen ? (
                            <span className="truncate">
                              {t(page.page_id, page.page_name)}
                            </span>
                          ) : (
                            <span className="mx-auto font-bold">
                              {t(page.page_id, page.page_name).slice(0, 1)}
                            </span>
                          )}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;

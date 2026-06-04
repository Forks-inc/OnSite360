import { useState } from "react";
import {
  MdPersonAdd,
  MdEdit,
  MdDelete,
  MdFileDownload,
  MdUpload,
  MdPeople,
  MdSchedule,
  MdSave,
  MdNoteAdd,
  MdCheck,
} from "react-icons/md";
import React from "react";
import TagsInput from "../components/TagsInput";
import {
  useProjectCrewMembers,
  useCreateCrewMember,
  useUpdateCrewMember,
  useDeleteCrewMember,
  useMarkAttendance,
  useAssignCrewMemberToProject,
  useProjectAttendanceByDate,
  type CrewMember,
  type CreateCrewMemberDto,
  type AttendanceRecord,
  type Project,
} from "../hooks/useProjects";
import { useUserProjects } from "../hooks/useUsers";
import { useAuthStore } from "../stores/useAuthStore";
import { useTranslation } from "../hooks/useTranslation";
import { TimecardsPanel } from "../components/workflows/WorkflowPanels";

// Add date-fns for date formatting (optional, or use native Date)
const todayStr = new Date().toISOString().slice(0, 10);

// Interface for crew assignment response
interface CrewAssignment {
  id: string;
  assignedDate: string;
  createdAt: string;
  crewMember: CrewMember;
  crewMemberId: string;
  endDate: string | null;
  isActive: boolean;
  notes: string;
  projectId: string;
  updatedAt: string;
}

// Interface for attendance API response
interface AttendanceApiResponse {
  statusCode: number;
  message: string;
  data: {
    id: string;
    projectId: string;
    date: string;
    actualStartTime?: string;
    workDelayed: boolean;
    delayReason?: string;
    delayDuration?: number;
    dayType?: string;
    dayTypeReason?: string;
    isWorkDay: boolean;
    notes?: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    crewAttendance?: (AttendanceRecord & { crewMemberId: string })[];
  };
}

// Interface for Axios error response
interface AxiosErrorResponse {
  response?: {
    status: number;
    data?: {
      message?: string;
    };
  };
  message: string;
}

// Common construction skills for quick selection
const COMMON_SKILLS = [
  "Safety Protocols",
  "Blueprint Reading",
  "Tool Operation",
  "Quality Control",
  "Time Management",
  "Heavy Machinery",
  "Electrical Work",
  "Plumbing",
  "Carpentry",
  "Welding",
  "Concrete Work",
  "Roofing",
  "HVAC",
  "Painting",
  "Drywall",
  "Flooring",
  "Project Management",
  "Team Leadership",
  "Equipment Maintenance",
  "Site Safety",
];

// Role-specific skill suggestions
const ROLE_SPECIFIC_SKILLS: Record<string, string[]> = {
  Carpenter: [
    "Carpentry",
    "Blueprint Reading",
    "Framing",
    "Finish Work",
    "Tool Operation",
  ],
  Electrician: [
    "Electrical Work",
    "Wiring",
    "Circuit Installation",
    "Safety Protocols",
    "Code Compliance",
  ],
  Plumber: [
    "Plumbing",
    "Pipe Installation",
    "Fixture Installation",
    "Blueprint Reading",
    "Leak Detection",
  ],
  Welder: [
    "Welding",
    "Metal Fabrication",
    "Arc Welding",
    "TIG Welding",
    "Safety Protocols",
  ],
  Mason: [
    "Masonry",
    "Bricklaying",
    "Stone Work",
    "Mortar Mixing",
    "Blueprint Reading",
  ],
  Roofer: [
    "Roofing",
    "Shingle Installation",
    "Safety Protocols",
    "Weather Sealing",
    "Material Handling",
  ],
  "HVAC Technician": [
    "HVAC",
    "Ductwork",
    "Climate Systems",
    "Electrical Work",
    "Troubleshooting",
  ],
  "Heavy Equipment Operator": [
    "Heavy Machinery",
    "Equipment Operation",
    "Safety Protocols",
    "Site Navigation",
    "Equipment Maintenance",
  ],
  "Safety Officer": [
    "Site Safety",
    "Safety Protocols",
    "Risk Assessment",
    "Training",
    "Compliance",
  ],
  Foreman: [
    "Team Leadership",
    "Project Management",
    "Safety Protocols",
    "Quality Control",
    "Scheduling",
  ],
  "Project Manager": [
    "Project Management",
    "Team Leadership",
    "Scheduling",
    "Budget Management",
    "Quality Control",
  ],
};

type WorkforceTab = "all" | "attendance" | "timecards" | "analytics";

const WORKFORCE_TAB_LABELS: Record<WorkforceTab, string> = {
  all: "All Staff",
  attendance: "Attendance",
  timecards: "Timecards",
  analytics: "Analytics",
};

// Extended CrewMember interface for UI state - currently unused but may be needed for future features
// interface CrewMemberWithAttendance extends CrewMember {
//   assignedTask?: string;
//   attendance?: string;
//   safetyStatus?: string;
// }

const WorkforceManagement = () => {
  const { t } = useTranslation();
  // State management
  const [activeTab, setActiveTab] = useState<WorkforceTab>("all");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [attendanceDate, setAttendanceDate] = useState<string>(todayStr);
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // API hooks
  const { user } = useAuthStore();
  const { data: projects = [], isLoading: projectsLoading } = useUserProjects(
    user?.id || ""
  );
  const { data: crewMembersResponse, isLoading: crewMembersLoading } =
    useProjectCrewMembers(selectedProject || "");

  // Fetch attendance data for the selected date
  const {
    data: attendanceResponse,
    isLoading: attendanceLoading,
    error: attendanceError,
  } = useProjectAttendanceByDate(selectedProject || "", attendanceDate);

  // Extract crew members from response - handle both .data and direct array
  const crewMembers = React.useMemo(() => {
    if (!crewMembersResponse) return [];

    let assignments: CrewAssignment[] = [];
    // Check if response has .data property or is direct array
    if (Array.isArray(crewMembersResponse)) {
      assignments = crewMembersResponse as CrewAssignment[];
    } else if (
      crewMembersResponse.data &&
      Array.isArray(crewMembersResponse.data)
    ) {
      assignments = crewMembersResponse.data as CrewAssignment[];
    } else {
      return [];
    }

    // Extract crew members from assignments and ensure they have the expected structure
    return assignments
      .map((assignment: CrewAssignment) => {
        if (assignment.crewMember) {
          // Return the crew member with assignment info
          return {
            ...assignment.crewMember,
            assignmentId: assignment.id,
            assignedDate: assignment.assignedDate,
            isActiveAssignment: assignment.isActive,
            assignmentNotes: assignment.notes,
          };
        }
        // Fallback for direct crew member objects (backward compatibility)
        return assignment.crewMember;
      })
      .filter((member) => member && member.id); // Filter out any invalid entries
  }, [crewMembersResponse]);

  const [editWorker, setEditWorker] = useState<CrewMember | null>(null);
  const [editWorkerData, setEditWorkerData] = useState<CreateCrewMemberDto>({
    name: "",
    role: "",
    phone: "",
    email: "",
    skills: [],
    isActive: true,
    hireDate: "",
  });
  const [newWorkerData, setNewWorkerData] = useState<CreateCrewMemberDto>({
    name: "",
    role: "",
    phone: "",
    email: "",
    skills: [],
    isActive: true,
    hireDate: "",
  });

  // Attendance state: { [workerId]: { status, notes } }
  const [attendanceState, setAttendanceState] = useState<
    Record<string, { status: string; notes: string }>
  >({});
  const [attendanceFilter] = useState<string>("all");

  // Bulk operations state
  const [bulkMode, setBulkMode] = useState<boolean>(false);
  const [bulkStatus, setBulkStatus] = useState<string>("Present");

  // Notes visibility state
  const [showNotes, setShowNotes] = useState<Record<string, boolean>>({});

  // Modal states for confirmations
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [workerToDelete, setWorkerToDelete] = useState<string | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<{
    loading: boolean;
    error: string | null;
    success: string | null;
    importedCount: number;
  }>({
    loading: false,
    error: null,
    success: null,
    importedCount: 0,
  });

  // Mutation hooks
  const createCrewMemberMutation = useCreateCrewMember();
  const updateCrewMemberMutation = useUpdateCrewMember();
  const deleteCrewMemberMutation = useDeleteCrewMember();
  const markAttendanceMutation = useMarkAttendance();
  const assignCrewMemberToProjectMutation = useAssignCrewMemberToProject();

  // Set default project when projects are loaded
  React.useEffect(() => {
    if (
      Array.isArray(projects) &&
      projects.length > 0 &&
      !selectedProject &&
      !projectsLoading
    ) {
      setSelectedProject(projects[0].id);
    }
  }, [projects, selectedProject, projectsLoading]);

  // State for tracking attendance data status
  const [attendanceDataStatus, setAttendanceDataStatus] = React.useState<{
    loading: boolean;
    error: string | null;
    noDataForDate: boolean;
  }>({
    loading: false,
    error: null,
    noDataForDate: false,
  });

  // Update attendance state when attendance data is fetched
  React.useEffect(() => {
    // Set loading state when attendance is being fetched
    if (attendanceLoading) {
      setAttendanceDataStatus({
        loading: true,
        error: null,
        noDataForDate: false,
      });
      return;
    }

    if (attendanceError) {
      console.error("Error fetching attendance data:", attendanceError);

      // Check if it's a 404 error (no attendance data for this date)
      const axiosError = attendanceError as AxiosErrorResponse;
      const is404Error = axiosError?.response?.status === 404;
      const errorMessage =
        axiosError?.response?.data?.message ||
        axiosError?.message ||
        "Unknown error";

      if (is404Error) {
        setAttendanceDataStatus({
          loading: false,
          error: null,
          noDataForDate: true,
        });
      } else {
        setAttendanceDataStatus({
          loading: false,
          error: `Failed to load attendance data: ${errorMessage}`,
          noDataForDate: false,
        });
      }

      setAttendanceState({});
      return;
    }

    if (attendanceResponse?.data) {
      // Handle the API response structure: { statusCode, message, data: attendance }
      const attendanceData =
        attendanceResponse.data as AttendanceApiResponse["data"];

      // Initialize attendance state object
      const newAttendanceState: Record<
        string,
        { status: string; notes: string }
      > = {};

      // Check if attendanceData has crewAttendance array
      if (
        attendanceData &&
        attendanceData.crewAttendance &&
        Array.isArray(attendanceData.crewAttendance)
      ) {
        attendanceData.crewAttendance.forEach((record) => {
          if (record.crewMemberId) {
            newAttendanceState[record.crewMemberId] = {
              status: record.status || "Present",
              notes: record.notes || "",
            };
          }
        });
      }

      setAttendanceState(newAttendanceState);
      setAttendanceDataStatus({
        loading: false,
        error: null,
        noDataForDate: false,
      });
    } else {
      // Reset attendance state if no data or when date changes
      setAttendanceState({});
      setAttendanceDataStatus({
        loading: false,
        error: null,
        noDataForDate: false,
      });
    }
  }, [attendanceResponse, attendanceError, attendanceLoading]);

  // Reset attendance state when project changes
  React.useEffect(() => {
    setAttendanceState({});
    setAttendanceDataStatus({
      loading: false,
      error: null,
      noDataForDate: false,
    });
  }, [selectedProject]);

  // Filter workers by project, search term, and attendance status
  const filteredWorkers = React.useMemo(() => {
    // Handle case when crewMembers is undefined, null, or not an array
    if (!crewMembers || !Array.isArray(crewMembers)) return [];

    return crewMembers.filter((worker: CrewMember) => {
      // Ensure worker has required properties
      if (!worker || !worker.name || typeof worker.name !== "string") {
        console.warn("Invalid worker object:", worker);
        return false;
      }

      const nameMatch = worker.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      if (activeTab === "attendance" && attendanceFilter !== "all") {
        const workerAttendance =
          attendanceState[worker.id]?.status ?? "Present";
        const attendanceMatch = workerAttendance === attendanceFilter;
        return nameMatch && attendanceMatch;
      }

      return nameMatch;
    });
  }, [crewMembers, searchTerm, activeTab, attendanceFilter, attendanceState]);

  // Helper: is selected date today?
  const isToday = attendanceDate === todayStr;

  // Handler for attendance change
  const handleAttendanceChange = (workerId: string, status: string) => {
    setAttendanceState((prev) => ({
      ...prev,
      [workerId]: {
        ...prev[workerId],
        status,
        notes: prev[workerId]?.notes || "",
      },
    }));
  };

  // Handler for notes change
  const handleNotesChange = (workerId: string, notes: string) => {
    setAttendanceState((prev) => ({
      ...prev,
      [workerId]: {
        ...prev[workerId],
        status: prev[workerId]?.status || "Present",
        notes,
      },
    }));
  };

  // Toggle notes visibility
  const toggleNotes = (workerId: string) => {
    setShowNotes((prev) => ({
      ...prev,
      [workerId]: !prev[workerId],
    }));
  };

  // Bulk attendance operations
  const applyBulkAttendance = () => {
    const updates: Record<string, { status: string; notes: string }> = {};
    (filteredWorkers || []).forEach((worker: CrewMember) => {
      updates[worker.id] = {
        status: bulkStatus,
        notes: attendanceState[worker.id]?.notes || "",
      };
    });
    setAttendanceState((prev) => ({ ...prev, ...updates }));
  };

  // Save all attendance changes
  const saveAttendanceChanges = async () => {
    if (!selectedProject) return;

    try {
      const crewAttendance: AttendanceRecord[] = Object.entries(
        attendanceState
      ).map(([crewMemberId, attendance]) => ({
        crewMemberId,
        status: attendance.status,
        notes: attendance.notes,
        checkInTime: new Date().toISOString(),
        isApproved: true,
      }));

      await markAttendanceMutation.mutateAsync({
        projectId: selectedProject,
        date: attendanceDate,
        crewAttendance,
      });

      setAttendanceState({});
      setShowSaveConfirm(false);
    } catch (error) {
      console.error("Failed to save attendance:", error);
    }
  };

  // Confirm save attendance changes
  const confirmSaveAttendance = () => {
    saveAttendanceChanges();
  };

  // Handle input changes for new worker form
  const handleNewWorkerChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewWorkerData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle input changes for edit worker form
  const handleEditWorkerChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditWorkerData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Open edit worker modal
  const handleEditWorker = (worker: CrewMember) => {
    setEditWorker(worker);
    setEditWorkerData({
      name: worker.name,
      role: worker.role,
      phone: worker.phone || "",
      email: worker.email || "",
      skills: worker.skills || [],
      isActive: worker.isActive,
      hireDate: worker.hireDate || "",
    });
  };

  // Add new worker
  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkerData.name || !newWorkerData.role) return;
    if (!selectedProject) {
      console.error("No project selected");
      alert("Please select a project before adding a worker.");
      return;
    }

    try {
      // First, create the crew member
      const createdCrewMember = await createCrewMemberMutation.mutateAsync(
        newWorkerData
      );

      // Then, assign the crew member to the selected project
      await assignCrewMemberToProjectMutation.mutateAsync({
        projectId: selectedProject,
        crewMemberId: createdCrewMember.data?.id,
        notes: `Automatically assigned to project on ${new Date().toLocaleDateString()}`,
      });

      // Success - reset form and close modal
      setShowAddWorker(false);
      setNewWorkerData({
        name: "",
        role: "",
        phone: "",
        email: "",
        skills: [],
        isActive: true,
        hireDate: "",
      });

      // Optional: Show success message (you might want to add a toast notification system)
      console.log("Successfully created and assigned crew member to project");
    } catch (error) {
      console.error("Failed to create and assign crew member:", error);
      // You might want to show an error message to the user here
      alert("Failed to add worker. Please try again.");
    }
  };

  // Update worker details
  const handleUpdateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editWorkerData.name || !editWorkerData.role || !editWorker) return;

    try {
      await updateCrewMemberMutation.mutateAsync({
        crewMemberId: editWorker.id,
        ...editWorkerData,
      });
      setEditWorker(null);
      setEditWorkerData({
        name: "",
        role: "",
        phone: "",
        email: "",
        skills: [],
        isActive: true,
        hireDate: "",
      });
    } catch (error) {
      console.error("Failed to update crew member:", error);
    }
  };

  // Delete worker (show modal instead of confirm)
  const handleDeleteWorker = (workerId: string) => {
    setWorkerToDelete(workerId);
    setShowDeleteConfirm(true);
  };

  // Confirm delete worker
  const confirmDeleteWorker = async () => {
    if (!workerToDelete) return;

    try {
      await deleteCrewMemberMutation.mutateAsync(workerToDelete);
      setShowDeleteConfirm(false);
      setWorkerToDelete(null);
    } catch (error) {
      console.error("Failed to delete crew member:", error);
    }
  };

  const handleExport = () => {
    if (!filteredWorkers.length) return;

    const csv =
      "ID,Name,Role,Phone,Email,Skills,Active Status,Hire Date,Created Date\n" +
      filteredWorkers
        .map(
          (w: CrewMember) =>
            `${w.id},"${w.name}","${w.role}","${w.phone || ""}","${
              w.email || ""
            }","${(w.skills || []).join("|")}",${
              w.isActive ? "Active" : "Inactive"
            },${
              w.hireDate ? new Date(w.hireDate).toLocaleDateString() : ""
            },${new Date(w.createdAt).toLocaleDateString()}`
        )
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Workforce_${
      projects.find((p: Project) => p.id === selectedProject)?.name || "Project"
    }.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      setImportFile(file);
      setImportStatus({
        loading: false,
        error: null,
        success: null,
        importedCount: 0,
      });
    } else {
      setImportStatus({
        loading: false,
        error: "Please select a valid CSV file",
        success: null,
        importedCount: 0,
      });
    }
  };

  const processImportCSV = async () => {
    if (!importFile || !selectedProject) return;

    setImportStatus({
      loading: true,
      error: null,
      success: null,
      importedCount: 0,
    });

    try {
      const text = await importFile.text();
      const lines = text.split("\n").filter((line) => line.trim());

      if (lines.length < 2) {
        throw new Error("CSV file appears to be empty or invalid");
      }

      const headers = lines[0]
        .split(",")
        .map((h) => h.trim().replace(/"/g, ""));

      // Validate that this is a workforce CSV with ID column
      const expectedHeaders = ["ID", "Name", "Role"];
      const hasRequiredHeaders = expectedHeaders.every((header) =>
        headers.some((h) => h.toLowerCase().includes(header.toLowerCase()))
      );

      if (!hasRequiredHeaders) {
        throw new Error(
          "Invalid CSV format. Please ensure this is a workforce export from OnSite360 platform with ID, Name, and Role columns."
        );
      }

      const idIndex = headers.findIndex((h) => h.toLowerCase() === "id");

      if (idIndex === -1) {
        throw new Error(
          "Missing ID column. Please use a CSV exported from OnSite360 platform."
        );
      }

      let importedCount = 0;
      const errors: string[] = [];

      // Process each worker line
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i]
          .split(",")
          .map((v) => v.trim().replace(/"/g, ""));

        if (values.length < headers.length) continue; // Skip incomplete lines

        const workerId = values[idIndex];

        if (!workerId) {
          errors.push(`Line ${i + 1}: Missing worker ID`);
          continue;
        }

        try {
          // Assign existing crew member to current project
          await assignCrewMemberToProjectMutation.mutateAsync({
            projectId: selectedProject,
            crewMemberId: workerId,
            notes: `Imported from CSV on ${new Date().toLocaleDateString()}`,
          });
          importedCount++;
        } catch (error) {
          console.error(`Failed to assign worker ${workerId}:`, error);
          errors.push(
            `Line ${
              i + 1
            }: Failed to assign worker (ID: ${workerId}) - worker may not exist or already be assigned`
          );
        }
      }

      if (importedCount > 0) {
        setImportStatus({
          loading: false,
          error:
            errors.length > 0
              ? `${errors.length} workers could not be imported. Check console for details.`
              : null,
          success: `Successfully imported ${importedCount} workers to the current project`,
          importedCount,
        });
      } else {
        setImportStatus({
          loading: false,
          error:
            errors.length > 0 ? errors.join("\n") : "No workers were imported",
          success: null,
          importedCount: 0,
        });
      }
    } catch (error) {
      console.error("Import error:", error);
      setImportStatus({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to process CSV file",
        success: null,
        importedCount: 0,
      });
    }
  };

  const resetImport = () => {
    setImportFile(null);
    setImportStatus({
      loading: false,
      error: null,
      success: null,
      importedCount: 0,
    });
  };

  return (
    <div className="p-8">
      {/* Heading with project selector */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t("workforce_title", "Workforce & Crew")}</h1>
          <p className="text-gray-500 mt-1">
            {t("workforce_subtitle", "Manage staff assignments, attendance, skills, and safety for your projects.")}
          </p>
        </div>
        <div>
          <select
            className="select select-bordered"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            disabled={projectsLoading}
          >
            {projectsLoading ? (
              <option>{t("loading_projects", "Loading projects...")}</option>
            ) : Array.isArray(projects) && projects.length > 0 ? (
              projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))
            ) : (
              <option>{t("no_projects_available", "No projects available")}</option>
            )}
          </select>
        </div>
      </div>
      <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
        {/* Tabs for workforce management */}
        <div className="tabs tabs-border mb-4">
          {(Object.keys(WORKFORCE_TAB_LABELS) as WorkforceTab[]).map((tab) => (
            <button
              key={tab}
              className={`tab text-base flex items-center gap-2 ${
                activeTab === tab ? "tab-active font-bold" : ""
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {t(`workforce_tab_${tab}`, WORKFORCE_TAB_LABELS[tab])}
            </button>
          ))}
        </div>

        {activeTab === "timecards" && (
          <TimecardsPanel
            projectId={selectedProject}
            crewMembers={crewMembers as CrewMember[]}
          />
        )}

        {/* Controls and Search bar in one row */}
        {activeTab !== "timecards" && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
          <div className="flex items-center gap-4">
            <button
              className="btn btn-primary flex items-center gap-2"
              onClick={() => setShowAddWorker(true)}
            >
              <MdPersonAdd />
              {t("add_worker", "Add Worker")}
            </button>
            <button
              className="btn btn-outline flex items-center gap-2"
              onClick={handleExport}
            >
              <MdFileDownload />
              {t("export_workforce", "Export Workforce (CSV)")}
            </button>
            <button
              className="btn btn-outline flex items-center gap-2"
              onClick={() => setShowImportModal(true)}
            >
              <MdUpload />
              {t("import_workers", "Import Workers (CSV)")}
            </button>
          </div>
          <div className="flex items-center justify-end">
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              placeholder={t("search_worker_placeholder", "Search worker by name...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        )}

        {/* Main content area - show loading contextually */}
        {activeTab !== "timecards" && (projectsLoading || crewMembersLoading || attendanceLoading ? (
          <div className="bg-base-100 rounded-lg p-8">
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <p className="mt-4 text-gray-500">
                  {projectsLoading
                    ? t("loading_projects", "Loading projects...")
                    : crewMembersLoading
                    ? t("loading_crew_members", "Loading crew members...")
                    : attendanceLoading
                    ? t("loading_attendance_data", "Loading attendance data...")
                    : t("loading_workforce_data", "Loading workforce data...")}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Workforce content */}

            {/* Add Worker Modal */}
            {showAddWorker && (
              <div className="modal modal-open">
                <div className="modal-box max-w-2xl">
                  <button
                    className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    onClick={() => setShowAddWorker(false)}
                  >
                    ✕
                  </button>
                  <h3 className="font-bold text-lg mb-2">{t("add_new_worker", "Add New Worker")}</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {t("worker_assigned_to", "Worker will be automatically assigned to:")}{" "}
                    <span className="font-semibold">
                      {projects.find((p: Project) => p.id === selectedProject)
                        ?.name || "Current Project"}
                    </span>
                  </p>
                  <form onSubmit={handleAddWorker} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="label">
                          <span className="label-text">{t("name_required", "Name *")}</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          className="input input-bordered w-full"
                          value={newWorkerData.name}
                          onChange={handleNewWorkerChange}
                          required
                        />
                      </div>
                      <div>
                        <label className="label">
                          <span className="label-text">{t("role_required", "Role *")}</span>
                        </label>
                        <select
                          name="role"
                          className="select select-bordered w-full"
                          value={newWorkerData.role}
                          onChange={handleNewWorkerChange}
                          required
                        >
                          <option value="">{t("select_role_placeholder", "Select a role")}</option>
                          <option value="Foreman">{t("role_foreman", "Foreman")}</option>
                          <option value="Carpenter">{t("role_carpenter", "Carpenter")}</option>
                          <option value="Electrician">{t("role_electrician", "Electrician")}</option>
                          <option value="Plumber">{t("role_plumber", "Plumber")}</option>
                          <option value="Mason">{t("role_mason", "Mason")}</option>
                          <option value="Roofer">{t("role_roofer", "Roofer")}</option>
                          <option value="HVAC Technician">
                            {t("role_hvac", "HVAC Technician")}
                          </option>
                          <option value="Heavy Equipment Operator">
                            {t("role_operator", "Heavy Equipment Operator")}
                          </option>
                          <option value="General Laborer">
                            {t("role_laborer", "General Laborer")}
                          </option>
                          <option value="Safety Officer">{t("role_safety", "Safety Officer")}</option>
                          <option value="Quality Control Inspector">
                            {t("role_qc", "Quality Control Inspector")}
                          </option>
                          <option value="Welder">{t("role_welder", "Welder")}</option>
                          <option value="Painter">{t("role_painter", "Painter")}</option>
                          <option value="Drywall Installer">
                            {t("role_drywall", "Drywall Installer")}
                          </option>
                          <option value="Flooring Specialist">
                            {t("role_flooring", "Flooring Specialist")}
                          </option>
                          <option value="Concrete Worker">
                            {t("role_concrete", "Concrete Worker")}
                          </option>
                          <option value="Landscaper">{t("role_landscaper", "Landscaper")}</option>
                          <option value="Other">{t("other", "Other")}</option>
                        </select>
                        {newWorkerData.role === "Other" && (
                          <input
                            type="text"
                            className="input input-bordered w-full mt-2"
                            placeholder={t("specify_custom_role", "Specify custom role")}
                            onChange={(e) =>
                              setNewWorkerData((prev) => ({
                                ...prev,
                                role: e.target.value,
                              }))
                            }
                          />
                        )}
                      </div>
                      <div>
                        <label className="label">
                          <span className="label-text">{t("phone", "Phone")}</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          className="input input-bordered w-full"
                          value={newWorkerData.phone}
                          onChange={handleNewWorkerChange}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                      <div>
                        <label className="label">
                          <span className="label-text">{t("email", "Email")}</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          className="input input-bordered w-full"
                          value={newWorkerData.email}
                          onChange={handleNewWorkerChange}
                          placeholder="worker@company.com"
                        />
                      </div>
                      <div>
                        <label className="label">
                          <span className="label-text">{t("hire_date", "Hire Date")}</span>
                        </label>
                        <input
                          type="date"
                          name="hireDate"
                          className="input input-bordered w-full"
                          value={newWorkerData.hireDate}
                          onChange={handleNewWorkerChange}
                        />
                      </div>
                      <div>
                        <label className="label">
                          <span className="label-text">{t("status", "Status")}</span>
                        </label>
                        <select
                          name="isActive"
                          className="select select-bordered w-full"
                          value={newWorkerData.isActive ? "true" : "false"}
                          onChange={(e) =>
                            setNewWorkerData((prev) => ({
                              ...prev,
                              isActive: e.target.value === "true",
                            }))
                          }
                        >
                          <option value="true">{t("active", "Active")}</option>
                          <option value="false">{t("inactive", "Inactive")}</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text">{t("skills", "Skills")}</span>
                      </label>
                      <TagsInput
                        value={newWorkerData.skills || []}
                        onChange={(skills) =>
                          setNewWorkerData((prev) => ({ ...prev, skills }))
                        }
                        placeholder={t("skills_placeholder", "Type skills and press Enter (e.g. Carpentry, Electrical Installation, Safety Protocols)")}
                        maxTags={20}
                        className="w-full"
                      />
                      <div className="mt-2">
                        {newWorkerData.role &&
                        ROLE_SPECIFIC_SKILLS[newWorkerData.role] ? (
                          <>
                            <div className="text-xs text-gray-600 mb-2">
                              {t("recommended_skills", "Recommended skills for ")}{newWorkerData.role}:
                            </div>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {ROLE_SPECIFIC_SKILLS[newWorkerData.role].map(
                                (skill) => (
                                  <button
                                    key={skill}
                                    type="button"
                                    className="btn btn-xs btn-primary btn-outline"
                                    onClick={() => {
                                      const currentSkills =
                                        newWorkerData.skills || [];
                                      if (!currentSkills.includes(skill)) {
                                        setNewWorkerData((prev) => ({
                                          ...prev,
                                          skills: [...currentSkills, skill],
                                        }));
                                      }
                                    }}
                                    disabled={(
                                      newWorkerData.skills || []
                                    ).includes(skill)}
                                  >
                                    {skill}
                                  </button>
                                )
                              )}
                            </div>
                          </>
                        ) : null}
                        <div className="text-xs text-gray-600 mb-2">
                          {t("other_common_skills", "Other common skills:")}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {COMMON_SKILLS.slice(0, 8).map((skill) => (
                            <button
                              key={skill}
                              type="button"
                              className="btn btn-xs btn-outline"
                              onClick={() => {
                                const currentSkills =
                                  newWorkerData.skills || [];
                                if (!currentSkills.includes(skill)) {
                                  setNewWorkerData((prev) => ({
                                    ...prev,
                                    skills: [...currentSkills, skill],
                                  }));
                                }
                              }}
                              disabled={(newWorkerData.skills || []).includes(
                                skill
                              )}
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="modal-action">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={
                          createCrewMemberMutation.isPending ||
                          assignCrewMemberToProjectMutation.isPending
                        }
                      >
                        {createCrewMemberMutation.isPending ||
                        assignCrewMemberToProjectMutation.isPending
                          ? createCrewMemberMutation.isPending
                            ? t("creating", "Creating...")
                            : t("assigning_project", "Assigning to Project...")
                          : t("add_worker_to_project", "Add Worker to Project")}
                      </button>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => setShowAddWorker(false)}
                      >
                        {t("cancel", "Cancel")}
                      </button>
                    </div>
                  </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                  <button onClick={() => setShowAddWorker(false)}>{t("close", "close")}</button>
                </form>
              </div>
            )}

            {/* Import Workers Modal */}
            {showImportModal && (
              <div className="modal modal-open">
                <div className="modal-box max-w-2xl">
                  <button
                    className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    onClick={() => {
                      setShowImportModal(false);
                      resetImport();
                    }}
                  >
                    ✕
                  </button>
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <MdUpload />
                    {t("import_workers_csv", "Import Workers from CSV")}
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="stroke-blue-500 shrink-0 w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      <div>
                        <h4 className="font-semibold text-blue-800 mb-1">
                          {t("import_instructions_title", "Import Instructions")}
                        </h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>
                            • {t("import_instruction_1", "Only CSV files exported from OnSite360 platform are supported")}
                          </li>
                          <li>
                            • {t("import_instruction_2", "Workers must already exist in the system (this assigns existing workers to current project)")}
                          </li>
                          <li>
                            • {t("import_instruction_3", "CSV must include ID column for proper worker identification")}
                          </li>
                          <li>
                            • {t("import_instruction_4", "Workers already assigned to this project will be skipped")}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {!importFile ? (
                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8">
                        <MdUpload className="text-4xl text-gray-400 mb-2" />
                        <p className="text-gray-600 mb-4">
                          {t("select_csv_import", "Select a CSV file to import workers")}
                        </p>
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleFileUpload}
                          className="file-input file-input-bordered file-input-primary w-full max-w-xs"
                        />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-gray-50 border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{t("selected_file_lbl", "Selected File:")}</p>
                              <p className="text-sm text-gray-600">
                                {importFile.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {t("file_size", "Size:")} {(importFile.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                            <button
                              className="btn btn-sm btn-ghost"
                              onClick={resetImport}
                            >
                              {t("remove", "Remove")}
                            </button>
                          </div>
                        </div>

                        {importStatus.error && (
                          <div className="alert alert-error">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="stroke-current shrink-0 h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="whitespace-pre-line">
                              {importStatus.error}
                            </span>
                          </div>
                        )}

                        {importStatus.success && (
                          <div className="alert alert-success">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="stroke-current shrink-0 h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span>{importStatus.success}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="modal-action">
                    {importFile && !importStatus.success && (
                      <button
                        className="btn btn-primary"
                        onClick={processImportCSV}
                        disabled={importStatus.loading || !selectedProject}
                      >
                        {importStatus.loading ? (
                          <>
                            <span className="loading loading-spinner loading-sm"></span>
                            {t("processing", "Processing...")}
                          </>
                        ) : (
                          <>
                            <MdUpload />
                            {t("import_workers", "Import Workers")}
                          </>
                        )}
                      </button>
                    )}
                    <button
                      className="btn"
                      onClick={() => {
                        setShowImportModal(false);
                        resetImport();
                      }}
                    >
                      {importStatus.success ? t("close", "Close") : t("cancel", "Cancel")}
                    </button>
                  </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      resetImport();
                    }}
                  >
                    {t("close", "close")}
                  </button>
                </form>
              </div>
            )}

            {/* Delete Worker Confirmation Modal */}
            {showDeleteConfirm && (
              <div className="modal modal-open">
                <div className="modal-box">
                  <h3 className="font-bold text-lg">{t("confirm_delete", "Confirm Delete")}</h3>
                  <p className="py-4">
                    {t("confirm_delete_worker_desc", "Are you sure you want to delete this worker?")}
                  </p>
                  <div className="modal-action">
                    <button
                      className="btn btn-error"
                      onClick={confirmDeleteWorker}
                    >
                      {t("delete", "Delete")}
                    </button>
                    <button
                      className="btn"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      {t("cancel", "Cancel")}
                    </button>
                  </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                  <button onClick={() => setShowDeleteConfirm(false)}>
                    {t("close", "close")}
                  </button>
                </form>
              </div>
            )}

            {/* Save Attendance Confirmation Modal */}
            {showSaveConfirm && (
              <div className="modal modal-open">
                <div className="modal-box">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <MdSave />
                    Save Attendance Changes
                  </h3>
                  <p className="py-4">
                    {t("save_attendance_confirm_desc", "Are you sure you want to save attendance changes for {count} workers for {date}?")
                      .replace("{count}", Object.keys(attendanceState).length.toString())
                      .replace("{date}", attendanceDate)}
                  </p>
                  <div className="modal-action">
                    <button
                      className="btn btn-success"
                      onClick={confirmSaveAttendance}
                    >
                      <MdSave />
                      {t("save_changes", "Save Changes")}
                    </button>
                    <button
                      className="btn"
                      onClick={() => setShowSaveConfirm(false)}
                    >
                      {t("cancel", "Cancel")}
                    </button>
                  </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                  <button onClick={() => setShowSaveConfirm(false)}>
                    {t("close", "close")}
                  </button>
                </form>
              </div>
            )}

            {/* Attendance Controls */}
            {activeTab === "attendance" && (
              <div className="bg-base-100 p-6 rounded-xl border border-base-300 mb-4">
                {/* Attendance Loading Indicator */}
                {attendanceDataStatus.loading && (
                  <div className="alert alert-info mb-4">
                    <span className="loading loading-spinner loading-sm"></span>
                    <span>
                      {t("loading_attendance_for_date", "Loading attendance data for {date}...")
                        .replace("{date}", attendanceDate)}
                    </span>
                  </div>
                )}

                {/* Attendance Status Message */}
                {attendanceDataStatus.noDataForDate && (
                  <div className="alert border-l-4 border-l-info bg-info/10 mb-10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      className="stroke-current shrink-0 w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <div>
                      <span className="font-medium">
                        {t("no_attendance_record_for_date", "No attendance record found for {date}")
                          .replace("{date}", attendanceDate)}
                      </span>
                      <div className="text-sm opacity-80 mt-1">
                        {isToday
                          ? t("instructions_today_attendance", "You can start recording attendance for today by marking worker status below and clicking 'Save Changes'.")
                          : t("instructions_past_attendance", "No attendance was recorded for this date. You can only modify attendance for today.")}
                      </div>
                    </div>
                  </div>
                )}

                {attendanceDataStatus.error && (
                  <div className="alert alert-error mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="stroke-current shrink-0 h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{attendanceDataStatus.error}</span>
                  </div>
                )}

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <label className="font-semibold flex items-center gap-2">
                      <span>{t("date_lbl", "Date:")}</span>
                      <input
                        type="date"
                        className="input input-bordered input-sm"
                        style={{ minWidth: "130px" }}
                        value={attendanceDate}
                        max={todayStr}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                      />
                    </label>

                    {isToday && (
                      <>
                        <div className="divider divider-horizontal"></div>
                        <div className="flex items-center gap-2">
                          <label className="label cursor-pointer flex items-center gap-2">
                            <span className="label-text font-medium">
                              {t("bulk_mode", "Bulk Mode:")}
                            </span>
                            <input
                              type="checkbox"
                              className="toggle toggle-primary"
                              checked={bulkMode}
                              onChange={(e) => setBulkMode(e.target.checked)}
                            />
                          </label>
                        </div>

                        {bulkMode && (
                          <div className="flex items-center gap-2">
                            <select
                              className="select select-bordered select-sm"
                              value={bulkStatus}
                              onChange={(e) => setBulkStatus(e.target.value)}
                            >
                              <option value="Present">{t("present", "Present")}</option>
                              <option value="Absent">{t("absent", "Absent")}</option>
                              <option value="Half Day">{t("half_day", "Half Day")}</option>
                              <option value="Sick Leave">{t("sick_leave", "Sick Leave")}</option>
                              <option value="Holiday">{t("holiday", "Holiday")}</option>
                            </select>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={applyBulkAttendance}
                            >
                              {t("apply_to_all", "Apply to All")} ({filteredWorkers?.length || 0})
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Save Changes button */}
                  {isToday && (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={saveAttendanceChanges}
                    >
                      <MdSave />
                      {t("save_changes", "Save Changes")}
                    </button>
                  )}
                </div>

                {/* Attendance Summary */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {(() => {
                    const stats = (filteredWorkers || []).reduce(
                      (acc: Record<string, number>, worker: CrewMember) => {
                        const status =
                          attendanceState[worker.id]?.status ?? "Present";
                        acc[status] = (acc[status] || 0) + 1;
                        return acc;
                      },
                      {} as Record<string, number>
                    );

                    return (
                      <>
                        <div className="stat bg-base-200 text-success rounded-xl border border-base-300">
                          <div className="stat-title text-xs opacity-80">
                            {t("present", "Present")}
                          </div>
                          <div className="stat-value text-2xl">
                            {stats.Present || 0}
                          </div>
                        </div>
                        <div className="stat bg-base-200 text-error rounded-xl border border-base-300">
                          <div className="stat-title text-xs opacity-80">
                            {t("absent", "Absent")}
                          </div>
                          <div className="stat-value text-2xl">
                            {stats.Absent || 0}
                          </div>
                        </div>
                        <div className="stat bg-base-200 text-warning rounded-xl border border-base-300">
                          <div className="stat-title text-xs opacity-80">
                            {t("half_day", "Half Day")}
                          </div>
                          <div className="stat-value text-2xl">
                            {stats["Half Day"] || 0}
                          </div>
                        </div>
                        <div className="stat bg-base-200 text-info rounded-xl border border-base-300">
                          <div className="stat-title text-xs opacity-80">
                            {t("sick_leave", "Sick Leave")}
                          </div>
                          <div className="stat-value text-2xl">
                            {stats["Sick Leave"] || 0}
                          </div>
                        </div>
                        <div className="stat bg-base-200 text-neutral rounded-xl border border-base-300">
                          <div className="stat-title text-xs opacity-80">
                            {t("holiday", "Holiday")}
                          </div>
                          <div className="stat-value text-2xl">
                            {stats.Holiday || 0}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* No Attendance Data Message for Attendance Tab */}
            {activeTab === "attendance" &&
              attendanceDataStatus.noDataForDate && (
                <div className="text-center py-12">
                  <div className="bg-base-100 p-8 rounded-xl border border-base-300">
                    <MdSchedule className="mx-auto text-6xl text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      {t("no_attendance_record", "No Attendance Record")}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {t("no_attendance_for_date", "No attendance has been recorded for {date}.")
                        .replace("{date}", attendanceDate)}
                    </p>
                    {isToday ? (
                      <div className="text-sm text-gray-600">
                        {!filteredWorkers || filteredWorkers.length === 0 ? (
                          <div>
                            <p className="mb-2 text-warning">
                              {t("no_crew_members_found", "No crew members found for this project.")}
                            </p>
                            <p className="mb-2">
                              {t("to_start_recording_attendance", "To start recording attendance:")}
                            </p>
                            <ol className="list-decimal list-inside space-y-1 text-left max-w-md mx-auto">
                              <li>
                                {t("instructions_step_1", "First, add crew members to this project using the 'Add Worker' button")}
                              </li>
                              <li>
                                {t("instructions_step_2", "Then return to the Attendance tab to record their attendance")}
                              </li>
                              <li>{t("instructions_step_3", "Mark attendance status for each worker")}</li>
                              <li>
                                {t("instructions_step_4", "Click 'Save Changes' to create the attendance record")}
                              </li>
                            </ol>
                          </div>
                        ) : (
                          <div>
                            <p className="mb-2">
                              {t("to_start_recording_attendance", "To start recording attendance:")}
                            </p>
                            <ol className="list-decimal list-inside space-y-1 text-left max-w-md mx-auto">
                              <li>
                                {t("instructions_step_alt_1", "Use the date selector above to ensure today's date is selected")}
                              </li>
                              <li>
                                {t("instructions_step_alt_2", "Mark attendance status for each worker (table will appear once attendance is created)")}
                              </li>
                              <li>
                                {t("instructions_step_alt_3", "Click 'Save Changes' to create the attendance record")}
                              </li>
                            </ol>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">
                        {t("attendance_today_only", "Attendance records can only be created for today's date.")}
                      </p>
                    )}
                  </div>
                </div>
              )}

            {/* Workforce Table - Only show if not on attendance tab with no data */}
            {!(
              activeTab === "attendance" && attendanceDataStatus.noDataForDate
            ) && (
              <div className="overflow-x-auto">
                <table className="table w-full bg-base-100 border border-base-300 rounded-2xl">
                  <thead>
                    <tr>
                      <th>{t("name", "Name")}</th>
                      <th>{t("role", "Role")}</th>
                      {activeTab === "attendance" ? (
                        <>
                          <th>{t("status", "Status")}</th>
                          <th>{t("quick_toggle", "Quick Toggle")}</th>
                          <th>{t("notes", "Notes")}</th>
                        </>
                      ) : activeTab === "all" ? (
                        <>
                          <th>{t("phone", "Phone")}</th>
                          <th>{t("email", "Email")}</th>
                          <th>{t("skills", "Skills")}</th>
                          <th>{t("hire_date", "Hire Date")}</th>
                          <th>{t("status", "Status")}</th>
                          <th>{t("created", "Created")}</th>
                          <th>{t("actions", "Actions")}</th>
                        </>
                      ) : null}
                    </tr>
                  </thead>
                  <tbody>
                    {activeTab === "analytics" ? (
                      <tr>
                        <td colSpan={2} className="p-0">
                          <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-4">
                                <button
                                  className="btn btn-ghost btn-sm"
                                  onClick={() => setActiveTab("all")}
                                >
                                  {t("back_to_all_staff", "← Back to All Staff")}
                                </button>
                                <h2 className="text-2xl font-bold">
                                  {t("workforce_analytics", "Workforce Analytics")}
                                </h2>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                              <div className="stat bg-base-100 rounded-xl shadow">
                                <div className="stat-title">{t("total_staff", "Total Staff")}</div>
                                <div className="stat-value text-primary">
                                  {filteredWorkers?.length || 0}
                                </div>
                                <div className="stat-desc">{t("all_roles", "All roles")}</div>
                              </div>
                              <div className="stat bg-base-100 rounded-xl shadow">
                                <div className="stat-title">{t("active_workers", "Active Workers")}</div>
                                <div className="stat-value text-success">
                                  {filteredWorkers?.filter(
                                    (w: CrewMember) => w.isActive
                                  ).length || 0}
                                </div>
                                <div className="stat-desc">
                                  {t("currently_active", "Currently active")}
                                </div>
                              </div>
                              <div className="stat bg-base-100 rounded-xl shadow">
                                <div className="stat-title">{t("total_skills", "Total Skills")}</div>
                                <div className="stat-value text-info">
                                  {
                                    Array.from(
                                      new Set(
                                        filteredWorkers?.flatMap(
                                          (w: CrewMember) => w.skills || []
                                        ) || []
                                      )
                                    ).length
                                  }
                                </div>
                                <div className="stat-desc">{t("unique_skills", "Unique skills")}</div>
                              </div>
                              <div className="stat bg-base-100 rounded-xl shadow">
                                <div className="stat-title">{t("roles", "Roles")}</div>
                                <div className="stat-value text-warning">
                                  {
                                    Array.from(
                                      new Set(
                                        filteredWorkers?.map(
                                          (w: CrewMember) => w.role
                                        ) || []
                                      )
                                    ).length
                                  }
                                </div>
                                <div className="stat-desc">{t("role_diversity", "Role diversity")}</div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div className="bg-base-100 p-4 rounded-xl">
                                <h3 className="font-bold text-lg mb-4">
                                  {t("active_status", "Active Status")}
                                </h3>
                                <div className="space-y-2">
                                  {Object.entries(
                                    (filteredWorkers || []).reduce(
                                      (
                                        acc: Record<string, number>,
                                        worker: CrewMember
                                      ) => {
                                        const status = worker.isActive
                                          ? "Active"
                                          : "Inactive";
                                        acc[status] = (acc[status] || 0) + 1;
                                        return acc;
                                      },
                                      {} as Record<string, number>
                                    )
                                  ).map(([status, count]) => (
                                    <div
                                      key={status}
                                      className="flex justify-between items-center"
                                    >
                                      <span
                                        className={`badge ${
                                          status === "Active"
                                            ? "badge-success"
                                            : "badge-error"
                                        }`}
                                      >
                                        {status}
                                      </span>
                                      <span className="font-bold">
                                        {count as number}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="bg-base-100 p-4 rounded-xl">
                                <h3 className="font-bold text-lg mb-4">
                                  {t("role_distribution", "Role Distribution")}
                                </h3>
                                <div className="space-y-2">
                                  {Object.entries(
                                    (filteredWorkers || []).reduce(
                                      (
                                        acc: Record<string, number>,
                                        worker: CrewMember
                                      ) => {
                                        const role = worker.role;
                                        acc[role] = (acc[role] || 0) + 1;
                                        return acc;
                                      },
                                      {} as Record<string, number>
                                    )
                                  ).map(([role, count]) => (
                                    <div
                                      key={role}
                                      className="flex justify-between items-center"
                                    >
                                      <span className="badge badge-outline">
                                        {role}
                                      </span>
                                      <span className="font-bold">
                                        {count as number}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="mt-6 bg-base-100 p-4 rounded-xl">
                              <h3 className="font-bold text-lg mb-4">
                                {t("skills_distribution", "Skills Distribution")}
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(
                                  (filteredWorkers || []).reduce(
                                    (
                                      acc: Record<string, number>,
                                      worker: CrewMember
                                    ) => {
                                      (worker.skills || []).forEach(
                                        (skill: string) => {
                                          acc[skill] = (acc[skill] || 0) + 1;
                                        }
                                      );
                                      return acc;
                                    },
                                    {} as Record<string, number>
                                  )
                                ).map(([skill, count]) => (
                                  <div
                                    key={skill}
                                    className="flex items-center gap-2 bg-neutral text-neutral-content px-3 py-1 rounded-lg"
                                  >
                                    <span>{skill}</span>
                                    <span className="badge badge-sm">
                                      {count as number}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : filteredWorkers && filteredWorkers.length > 0 ? (
                      filteredWorkers.map((worker: CrewMember) => {
                        // For attendance: use attendanceState or default to "Present"
                        const att =
                          attendanceState[worker.id]?.status ?? "Present";

                        if (activeTab === "attendance") {
                          // Enhanced attendance view with toggle buttons and notes
                          return (
                            <tr key={worker.id} className="hover:bg-base-200">
                              <td className="font-medium flex items-center gap-2">
                                <div className="w-8 h-8 min-w-8 rounded-full bg-primary/20 flex items-center justify-center">
                                  <span className="text-xs font-medium text-primary">
                                    {worker.name.charAt(0)}
                                  </span>
                                </div>
                                {worker.name}
                                <span className="text-sm text-gray-500">
                                  ({worker.role})
                                </span>
                              </td>
                              <td>{worker.role}</td>
                              <td>
                                {isToday ? (
                                  <select
                                    className={`select select-sm select-bordered ${
                                      att === "Present"
                                        ? "select-success"
                                        : att === "Absent"
                                        ? "select-error"
                                        : att === "Half Day"
                                        ? "select-warning"
                                        : att === "Sick Leave"
                                        ? "select-info"
                                        : att === "Holiday"
                                        ? "select-neutral"
                                        : "select-bordered"
                                    }`}
                                    value={att}
                                    onChange={(e) =>
                                      handleAttendanceChange(
                                        worker.id,
                                        e.target.value
                                      )
                                    }
                                  >
                                    <option value="Present">{t("present", "Present")}</option>
                                    <option value="Absent">{t("absent", "Absent")}</option>
                                    <option value="Half Day">{t("half_day", "Half Day")}</option>
                                    <option value="Sick Leave">
                                      {t("sick_leave", "Sick Leave")}
                                    </option>
                                    <option value="Holiday">{t("holiday", "Holiday")}</option>
                                  </select>
                                ) : (
                                  <span
                                    className={`badge badge-lg ${
                                      att === "Present"
                                        ? "badge-success"
                                        : att === "Absent"
                                        ? "badge-error"
                                        : att === "Half Day"
                                        ? "badge-warning"
                                        : att === "Sick Leave"
                                        ? "badge-info"
                                        : att === "Holiday"
                                        ? "badge-neutral"
                                        : "badge-ghost"
                                    }`}
                                  >
                                    {att === "Present" ? t("present", "Present") : att === "Absent" ? t("absent", "Absent") : att === "Half Day" ? t("half_day", "Half Day") : att === "Sick Leave" ? t("sick_leave", "Sick Leave") : att === "Holiday" ? t("holiday", "Holiday") : att}
                                  </span>
                                )}
                              </td>
                              <td>
                                {isToday && (
                                  <div className="flex items-center gap-2">
                                    <label className="label cursor-pointer flex items-center gap-2">
                                      <span className="label-text text-sm">
                                        {t("present_lbl", "Present:")}
                                      </span>
                                      <input
                                        type="checkbox"
                                        className="toggle toggle-success toggle-sm"
                                        checked={att === "Present"}
                                        onChange={(e) => {
                                          handleAttendanceChange(
                                            worker.id,
                                            e.target.checked
                                              ? "Present"
                                              : "Absent"
                                          );
                                        }}
                                      />
                                    </label>
                                  </div>
                                )}
                              </td>
                              <td>
                                <div className="flex items-center gap-2">
                                  {showNotes[worker.id] ? (
                                    <div className="flex items-center gap-2 w-full">
                                      <input
                                        type="text"
                                        className="input input-xs input-bordered flex-1"
                                        placeholder={t("add_notes_placeholder", "Add notes...")}
                                        value={
                                          attendanceState[worker.id]?.notes ||
                                          ""
                                        }
                                        onChange={(e) =>
                                          handleNotesChange(
                                            worker.id,
                                            e.target.value
                                          )
                                        }
                                        disabled={!isToday}
                                      />
                                      <button
                                        className="btn btn-ghost btn-xs"
                                        onClick={() => toggleNotes(worker.id)}
                                      >
                                        <MdCheck />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      {attendanceState[worker.id]?.notes && (
                                        <span className="text-xs text-gray-600 truncate max-w-20">
                                          {attendanceState[worker.id].notes}
                                        </span>
                                      )}
                                      <button
                                        className="btn btn-ghost btn-xs"
                                        onClick={() => toggleNotes(worker.id)}
                                        disabled={!isToday}
                                      >
                                        <MdNoteAdd />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        }

                        if (activeTab === "all") {
                          return (
                            <tr key={worker.id} className="hover:bg-base-200">
                              <td className="font-medium flex items-center gap-2">
                                <div className="w-8 h-8 min-w-8 rounded-full bg-primary/20 flex items-center justify-center">
                                  <span className="text-xs font-medium text-primary">
                                    {worker.name.charAt(0)}
                                  </span>
                                </div>
                                {worker.name}
                              </td>
                              <td>{worker.role}</td>
                              <td>{worker.phone || "N/A"}</td>
                              <td>{worker.email || "N/A"}</td>
                              <td>
                                <div className="flex flex-wrap gap-1">
                                  {(worker.skills || []).map(
                                    (skill: string) => (
                                      <span
                                        key={skill}
                                        className="badge badge-neutral"
                                      >
                                        {skill}
                                      </span>
                                    )
                                  )}
                                </div>
                              </td>
                              <td>
                                {worker.hireDate ? (
                                  <span className="text-sm">
                                    {new Date(
                                      worker.hireDate
                                    ).toLocaleDateString()}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">N/A</span>
                                )}
                              </td>
                              <td>
                                <span
                                  className={`badge ${
                                    worker.isActive
                                      ? "badge-success"
                                      : "badge-error"
                                  }`}
                                >
                                  {worker.isActive ? t("active", "Active") : t("inactive", "Inactive")}
                                </span>
                              </td>
                              <td>
                                <span className="text-sm text-gray-500">
                                  {new Date(
                                    worker.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </td>
                              <td>
                                <div className="flex gap-2">
                                  <button
                                    className="btn btn-sm btn-primary"
                                    title={t("edit_worker", "Edit Worker")}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditWorker(worker);
                                    }}
                                  >
                                    <MdEdit />
                                  </button>
                                  <button
                                    className="btn btn-sm btn-error"
                                    title={t("delete_worker", "Delete Worker")}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteWorker(worker.id);
                                    }}
                                  >
                                    <MdDelete />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        }

                        return null;
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={
                            activeTab === "attendance"
                              ? 5
                              : activeTab === "all"
                              ? 9
                              : 2
                          }
                          className="text-center text-gray-500 py-8"
                        >
                          {t("no_workforce_data", "No workforce data found for this project.")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Edit Worker Modal */}
            {editWorker && (
              <div className="modal modal-open">
                <div className="modal-box max-w-2xl">
                  <button
                    className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    onClick={() => setEditWorker(null)}
                  >
                    ✕
                  </button>
                  <h3 className="font-bold text-lg mb-4">{t("edit_worker", "Edit Worker")}</h3>
                  <form onSubmit={handleUpdateWorker}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="label font-semibold">{t("name", "Name")}</label>
                        <input
                          className="input input-bordered w-full"
                          name="name"
                          value={editWorkerData.name}
                          onChange={handleEditWorkerChange}
                          required
                        />
                      </div>
                      <div>
                        <label className="label font-semibold">{t("role", "Role")}</label>
                        <select
                          name="role"
                          className="select select-bordered w-full"
                          value={editWorkerData.role}
                          onChange={handleEditWorkerChange}
                          required
                        >
                          <option value="">{t("select_role_placeholder", "Select a role")}</option>
                          <option value="Project Manager">
                            {t("role_pm", "Project Manager")}
                          </option>
                          <option value="Site Supervisor">
                            {t("role_supervisor", "Site Supervisor")}
                          </option>
                          <option value="Foreman">{t("role_foreman", "Foreman")}</option>
                          <option value="Carpenter">{t("role_carpenter", "Carpenter")}</option>
                          <option value="Electrician">{t("role_electrician", "Electrician")}</option>
                          <option value="Plumber">{t("role_plumber", "Plumber")}</option>
                          <option value="Mason">{t("role_mason", "Mason")}</option>
                          <option value="Roofer">{t("role_roofer", "Roofer")}</option>
                          <option value="HVAC Technician">
                            {t("role_hvac", "HVAC Technician")}
                          </option>
                          <option value="Heavy Equipment Operator">
                            {t("role_operator", "Heavy Equipment Operator")}
                          </option>
                          <option value="General Laborer">
                            {t("role_laborer", "General Laborer")}
                          </option>
                          <option value="Safety Officer">{t("role_safety", "Safety Officer")}</option>
                          <option value="Quality Control Inspector">
                            {t("role_qc", "Quality Control Inspector")}
                          </option>
                          <option value="Welder">{t("role_welder", "Welder")}</option>
                          <option value="Painter">{t("role_painter", "Painter")}</option>
                          <option value="Drywall Installer">
                            {t("role_drywall", "Drywall Installer")}
                          </option>
                          <option value="Flooring Specialist">
                            {t("role_flooring", "Flooring Specialist")}
                          </option>
                          <option value="Concrete Worker">
                            {t("role_concrete", "Concrete Worker")}
                          </option>
                          <option value="Landscaper">{t("role_landscaper", "Landscaper")}</option>
                          <option value="Other">{t("other", "Other")}</option>
                        </select>
                        {editWorkerData.role === "Other" && (
                          <input
                            type="text"
                            className="input input-bordered w-full mt-2"
                            placeholder={t("specify_custom_role", "Specify custom role")}
                            onChange={(e) =>
                              setEditWorkerData((prev) => ({
                                ...prev,
                                role: e.target.value,
                              }))
                            }
                          />
                        )}
                      </div>
                      <div>
                        <label className="label font-semibold">{t("phone", "Phone")}</label>
                        <input
                          className="input input-bordered w-full"
                          name="phone"
                          type="tel"
                          value={editWorkerData.phone || ""}
                          onChange={handleEditWorkerChange}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                      <div>
                        <label className="label font-semibold">{t("email", "Email")}</label>
                        <input
                          className="input input-bordered w-full"
                          name="email"
                          type="email"
                          value={editWorkerData.email || ""}
                          onChange={handleEditWorkerChange}
                          placeholder="worker@company.com"
                        />
                      </div>
                      <div>
                        <label className="label font-semibold">{t("hire_date", "Hire Date")}</label>
                        <input
                          className="input input-bordered w-full"
                          name="hireDate"
                          type="date"
                          value={editWorkerData.hireDate || ""}
                          onChange={handleEditWorkerChange}
                        />
                      </div>
                      <div>
                        <label className="label font-semibold">{t("status", "Status")}</label>
                        <select
                          className="select select-bordered w-full"
                          name="isActive"
                          value={editWorkerData.isActive ? "true" : "false"}
                          onChange={(e) =>
                            setEditWorkerData((prev) => ({
                              ...prev,
                              isActive: e.target.value === "true",
                            }))
                          }
                        >
                          <option value="true">{t("active", "Active")}</option>
                          <option value="false">{t("inactive", "Inactive")}</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="label font-semibold">{t("skills", "Skills")}</label>
                      <TagsInput
                        value={editWorkerData.skills || []}
                        onChange={(skills) =>
                          setEditWorkerData((prev) => ({ ...prev, skills }))
                        }
                        placeholder={t("skills_placeholder", "Type skills and press Enter (e.g. Carpentry, Electrical Installation, Safety Protocols)")}
                        maxTags={20}
                        className="w-full"
                      />
                      <div className="mt-2">
                        {editWorkerData.role &&
                        ROLE_SPECIFIC_SKILLS[editWorkerData.role] ? (
                          <>
                            <div className="text-xs text-gray-600 mb-2">
                              {t("recommended_skills", "Recommended skills for ")}{editWorkerData.role}:
                            </div>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {ROLE_SPECIFIC_SKILLS[editWorkerData.role].map(
                                (skill) => (
                                  <button
                                    key={skill}
                                    type="button"
                                    className="btn btn-xs btn-primary btn-outline"
                                    onClick={() => {
                                      const currentSkills =
                                        editWorkerData.skills || [];
                                      if (!currentSkills.includes(skill)) {
                                        setEditWorkerData((prev) => ({
                                          ...prev,
                                          skills: [...currentSkills, skill],
                                        }));
                                      }
                                    }}
                                    disabled={(
                                      editWorkerData.skills || []
                                    ).includes(skill)}
                                  >
                                    {skill}
                                  </button>
                                )
                              )}
                            </div>
                          </>
                        ) : null}
                        <div className="text-xs text-gray-600 mb-2">
                          {t("other_common_skills", "Other common skills:")}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {COMMON_SKILLS.slice(0, 8).map((skill) => (
                            <button
                              key={skill}
                              type="button"
                              className="btn btn-xs btn-outline"
                              onClick={() => {
                                const currentSkills =
                                  editWorkerData.skills || [];
                                if (!currentSkills.includes(skill)) {
                                  setEditWorkerData((prev) => ({
                                    ...prev,
                                    skills: [...currentSkills, skill],
                                  }));
                                }
                              }}
                              disabled={(editWorkerData.skills || []).includes(
                                skill
                              )}
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="modal-action">
                      <button
                        className="btn btn-primary"
                        type="submit"
                        disabled={updateCrewMemberMutation.isPending}
                      >
                        {updateCrewMemberMutation.isPending
                          ? t("updating", "Updating...")
                          : t("update_worker", "Update Worker")}
                      </button>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => setEditWorker(null)}
                      >
                        {t("cancel", "Cancel")}
                      </button>
                    </div>
                  </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                  <button onClick={() => setEditWorker(null)}>{t("close", "close")}</button>
                </form>
              </div>
            )}

            {/* Loading and Error States */}
            {!projectsLoading &&
              !crewMembersLoading &&
              (!crewMembers ||
                !Array.isArray(crewMembers) ||
                crewMembers.length === 0) && (
                <div className="text-center py-8">
                  <div className="bg-base-100 p-6 rounded-xl border border-base-300">
                    <MdPeople className="mx-auto text-4xl text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {t("no_crew_members_found_title", "No Crew Members Found")}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {t("no_crew_members_desc", "Get started by adding your first crew member to this project.")}
                    </p>
                    <button
                      className="btn btn-primary"
                      onClick={() => setShowAddWorker(true)}
                    >
                      <MdPersonAdd />
                      {t("add_first_crew_member", "Add First Crew Member")}
                    </button>
                  </div>
                </div>
              )}

            {!filteredWorkers.length &&
              !projectsLoading &&
              !crewMembersLoading &&
              crewMembers &&
              Array.isArray(crewMembers) &&
              crewMembers.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {t("no_workers_match_search", "No workers match your current search criteria.")}
                  </p>
                </div>
              )}
          </>
        ))}
      </div>
    </div>
  );
};

export default WorkforceManagement;

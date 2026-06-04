import { useState, useMemo } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import { IoClose, IoAttach, IoTrash, IoEye, IoPencil } from "react-icons/io5";
import {
  useProjects,
  useAllIssues,
  useProjectIssues,
  useCreateIssue,
  useUpdateIssue,
  useDeleteIssue,
  useProjectUsers,
  IssueCategory,
  IssueSeverity,
  type Issue,
  type CreateIssueDto,
  type UpdateIssueDto,
  type Project,
} from "../hooks/useProjects";
import { useTranslation } from "../hooks/useTranslation";
import { PunchListPanel } from "../components/workflows/WorkflowPanels";

const IssueReporting = () => {
  const { t } = useTranslation();

  // Auth store
  const { user: currentUser } = useAuthStore();

  // API hooks
  const { data: projectsResponse = [], isLoading: projectsLoading } =
    useProjects();
  const { data: allIssuesResponse } = useAllIssues();

  // State
  const [activeTab, setActiveTab] = useState("issues");
  const [selectedProject, setSelectedProject] = useState<string>("");

  // Get project-specific issues when a project is selected
  const { data: projectIssuesResponse } = useProjectIssues(
    selectedProject || ""
  );

  // Get project users for tagging
  const { data: projectUsersResponse } = useProjectUsers(selectedProject || "");

  // Extract projects from response
  const projects = useMemo(() => {
    if (!projectsResponse) return [];
    if (Array.isArray(projectsResponse)) return projectsResponse;
    return (projectsResponse as any).data || [];
  }, [projectsResponse]);

  // Extract issues from response
  const issues = useMemo(() => {
    let issuesData = [];

    if (selectedProject) {
      // Use project-specific issues
      if (projectIssuesResponse) {
        issuesData = Array.isArray(projectIssuesResponse)
          ? projectIssuesResponse
          : (projectIssuesResponse as any).data || [];
      }
    } else {
      // Use all issues
      if (allIssuesResponse) {
        issuesData = Array.isArray(allIssuesResponse)
          ? allIssuesResponse
          : (allIssuesResponse as any).data || [];
      }
    }

    return issuesData;
  }, [selectedProject, projectIssuesResponse, allIssuesResponse]);

  // Extract project users from response
  const projectUsers = useMemo(() => {
    if (!projectUsersResponse) return [];
    if (Array.isArray(projectUsersResponse)) return projectUsersResponse;
    return (projectUsersResponse as any).data || [];
  }, [projectUsersResponse]);

  // Mutation hooks
  const createIssueMutation = useCreateIssue();
  const updateIssueMutation = useUpdateIssue();
  const deleteIssueMutation = useDeleteIssue();

  // Create issue modal state
  const [showCreateIssueModal, setShowCreateIssueModal] = useState(false);
  const [selectedTaggedUsers, setSelectedTaggedUsers] = useState<number[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  // Edit issue modal state
  const [showEditIssueModal, setShowEditIssueModal] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [editSelectedTaggedUsers, setEditSelectedTaggedUsers] = useState<
    number[]
  >([]);

  // Delete confirmation state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingIssue, setDeletingIssue] = useState<Issue | null>(null);

  // View issue modal state
  const [showViewIssueModal, setShowViewIssueModal] = useState(false);
  const [viewingIssue, setViewingIssue] = useState<Issue | null>(null);

  // Filter issues based on selected project (already filtered by API)
  const filteredIssues = useMemo(() => {
    if (!Array.isArray(issues)) return [];
    return issues as Issue[];
  }, [issues]);

  // Analytics data
  const analyticsData = useMemo(() => {
    if (!Array.isArray(filteredIssues)) {
      return { issuesByStatus: {}, issuesBySeverity: {}, issuesByCategory: {} };
    }

    const issuesByStatus = filteredIssues.reduce(
      (acc: Record<string, number>, issue: Issue) => {
        acc[issue.status] = (acc[issue.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const issuesBySeverity = filteredIssues.reduce(
      (acc: Record<string, number>, issue: Issue) => {
        acc[issue.severity] = (acc[issue.severity] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const issuesByCategory = filteredIssues.reduce(
      (acc: Record<string, number>, issue: Issue) => {
        acc[issue.category] = (acc[issue.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return { issuesByStatus, issuesBySeverity, issuesByCategory };
  }, [filteredIssues]);

  // Helper functions
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Open":
        return "badge-error";
      case "In Progress":
        return "badge-warning";
      case "Resolved":
        return "badge-success";
      case "Closed":
        return "badge-neutral";
      default:
        return "badge-neutral";
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "badge-error";
      case "High":
        return "badge-warning";
      case "Medium":
        return "badge-info";
      case "Low":
        return "badge-neutral";
      default:
        return "badge-neutral";
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "Safety":
        return "badge-error";
      case "Quality":
        return "badge-warning";
      case "Delay":
        return "badge-info";
      case "Equipment":
        return "badge-primary";
      case "Environmental":
        return "badge-secondary";
      case "Material":
        return "badge-accent";
      case "Other":
        return "badge-neutral";
      default:
        return "badge-neutral";
    }
  };

  // Create issue handlers
  const handleCreateIssue = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    if (!selectedProject) {
      alert(t("select_project_first", "Please select a project first"));
      return;
    }

    try {
      const createIssueData: CreateIssueDto = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        severity: formData.get("severity") as string,
        location: (formData.get("location") as string) || undefined,
        reportedBy:
          `${currentUser?.firstName || ""} ${
            currentUser?.lastName || ""
          }`.trim() || "Unknown",
        taggedUserIds: selectedTaggedUsers.map((id) => id.toString()),
        dueDate: (formData.get("dueDate") as string) || undefined,
        attachmentIds: [], // For now, we'll handle file uploads separately
      };

      await createIssueMutation.mutateAsync({
        projectId: selectedProject,
        ...createIssueData,
      });

      // Success - reset form and close modal
      setShowCreateIssueModal(false);
      (event.target as HTMLFormElement).reset();
      setSelectedTaggedUsers([]);
      setUploadedFiles([]);
    } catch (error) {
      console.error("Failed to create issue:", error);
      alert(t("error", "Error") + ": " + t("failed_create_permission", "Failed to create issue. Please try again."));
    }
  };

  const handleAddTaggedUser = (userId: number) => {
    if (!selectedTaggedUsers.includes(userId)) {
      setSelectedTaggedUsers((prev) => [...prev, userId]);
    }
  };

  const handleRemoveTaggedUser = (userId: number) => {
    setSelectedTaggedUsers((prev) => prev.filter((id) => id !== userId));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileNames = Array.from(files).map((file) => file.name);
      setUploadedFiles((prev) => [...prev, ...fileNames]);
    }
  };

  const handleRemoveFile = (fileName: string) => {
    setUploadedFiles((prev) => prev.filter((name) => name !== fileName));
  };

  // Edit issue handlers
  const handleEditIssue = (issue: Issue) => {
    setEditingIssue(issue);
    // Extract user IDs from tagged users
    const taggedUserIds =
      issue.taggedUsers?.map((user) => Number(user.id)) || [];
    setEditSelectedTaggedUsers(taggedUserIds);
    setShowEditIssueModal(true);
  };

  const handleUpdateIssue = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingIssue || !selectedProject) return;

    try {
      const formData = new FormData(event.currentTarget);
      const updateIssueData: UpdateIssueDto = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        severity: formData.get("severity") as string,
        status: formData.get("status") as string,
        location: (formData.get("location") as string) || undefined,
        taggedUserIds: editSelectedTaggedUsers.map((id) => id.toString()),
        dueDate: (formData.get("dueDate") as string) || undefined,
        resolution: (formData.get("resolution") as string) || undefined,
      };

      await updateIssueMutation.mutateAsync({
        projectId: selectedProject,
        issueId: editingIssue.id,
        ...updateIssueData,
      });

      // Success - reset form and close modal
      setShowEditIssueModal(false);
      setEditingIssue(null);
      setEditSelectedTaggedUsers([]);
    } catch (error) {
      console.error("Failed to update issue:", error);
      alert(t("error", "Error") + ": " + t("failed_update_permission", "Failed to update issue. Please try again."));
    }
  };

  // Delete issue handlers
  const handleDeleteIssue = (issue: Issue) => {
    setDeletingIssue(issue);
    setShowDeleteModal(true);
  };

  const confirmDeleteIssue = async () => {
    if (!deletingIssue || !selectedProject) return;

    try {
      await deleteIssueMutation.mutateAsync({
        projectId: selectedProject,
        issueId: deletingIssue.id,
      });

      // Success - close modal
      setShowDeleteModal(false);
      setDeletingIssue(null);
    } catch (error) {
      console.error("Failed to delete issue:", error);
      alert(t("error", "Error") + ": " + t("failed_delete_permission", "Failed to delete issue. Please try again."));
    }
  };

  // View issue handler
  const handleViewIssue = (issue: Issue) => {
    setViewingIssue(issue);
    setShowViewIssueModal(true);
  };

  return (
    <div className="p-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("issue_reporting_title", "Issue Reporting")}</h1>
          <p className="text-gray-500 mt-1">
            {t("issue_reporting_subtitle", "Track and manage project issues, bugs, and concerns")}
          </p>
        </div>

        {/* Project selection in header */}
        <div className="flex items-center justify-end mb-1">
          <div className="flex gap-4 items-center">
            <select
              className="select select-bordered"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              disabled={projectsLoading}
            >
              <option value="">{t("all_projects", "All Projects")}</option>
              {projects.map((project: Project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="tabs tabs-border">
        <button
          className={`tab text-base ${
            activeTab === "issues" ? "tab-active font-bold" : ""
          }`}
          onClick={() => setActiveTab("issues")}
        >
          {t("issues_overview", "Issues Overview")}
        </button>
        <button
          className={`tab text-base ${
            activeTab === "analytics" ? "tab-active font-bold" : ""
          }`}
          onClick={() => setActiveTab("analytics")}
        >
          {t("analytics", "Analytics")}
        </button>
        <button
          className={`tab text-base ${
            activeTab === "punch-list" ? "tab-active font-bold" : ""
          }`}
          onClick={() => setActiveTab("punch-list")}
        >
          {t("punch_list", "Punch List")}
        </button>
      </div>

      <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
        {/* Tab Content */}
        <div className="mt-4">
          {/* Issues Overview */}
          {activeTab === "issues" && (
            <div className="my-1">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{t("issues_overview", "Issues Overview")}</h2>
                  <p className="text-neutral-500">
                    {t("issues_overview_desc", "View and manage all reported issues")}
                  </p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowCreateIssueModal(true)}
                  disabled={!selectedProject}
                  title={
                    !selectedProject ? t("select_project_first", "Please select a project first") : ""
                  }
                >
                  + {t("report_issue", "Report Issue")}
                </button>
              </div>

              {/* Loading state for issues */}
              {projectsLoading ? (
                <div className="flex justify-center items-center h-64">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : filteredIssues.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl text-base-content/20 mb-4">🐛</div>
                  <h3 className="text-xl font-semibold text-base-content/70 mb-2">
                    {selectedProject
                      ? t("no_issues_project", "No issues found for the selected project.")
                      : t("no_issues_found_issue_desc", "No issues found. Report your first issue to get started.")}
                  </h3>
                  <p className="text-base-content/50 mb-6">
                    {t("create_first_issue_desc", "Create your first issue report to track problems and improvements")}
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowCreateIssueModal(true)}
                    disabled={!selectedProject}
                  >
                    {t("report_first_issue", "Report First Issue")}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="flex flex-col lg:flex-row lg:items-start justify-between border border-base-300 bg-base-100 rounded-2xl p-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="badge badge-neutral font-mono">
                            {issue.id}
                          </span>
                          <span
                            className={`badge ${getCategoryBadge(
                              issue.category
                            )}`}
                          >
                            {t("cat_" + issue.category.toLowerCase(), issue.category)}
                          </span>
                          <span
                            className={`badge ${getSeverityBadge(
                              issue.severity
                            )}`}
                          >
                            {t(issue.severity.toLowerCase(), issue.severity)}
                          </span>
                          <span
                            className={`badge ${getStatusBadge(issue.status)}`}
                          >
                            {t(issue.status.toLowerCase().replace(" ", "_"), issue.status)}
                          </span>
                        </div>

                        <div className="font-semibold text-lg mb-1">
                          {issue.title}
                        </div>

                        <div className="text-gray-500 text-sm mb-2 line-clamp-2">
                          {issue.description}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>
                            {t("reported_by", "Reported by")}: {issue.reporter?.firstName}{" "}
                            {issue.reporter?.lastName || issue.reportedBy}
                          </span>
                          <span>
                            {new Date(issue.createdAt).toLocaleDateString()}
                          </span>
                          {issue.location && (
                            <span>{t("location_colon", "Location: ")}{issue.location}</span>
                          )}
                          {issue.dueDate && (
                            <span>
                              {t("due_colon", "Due: ")}{" "}
                              {new Date(issue.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        {issue.attachments && issue.attachments.length > 0 && (
                          <div className="mt-2">
                            <span className="text-sm font-medium text-gray-600">
                              {t("attachments_count", "Attachments: ")}{issue.attachments.length} {t("files_parentheses", "file(s)")}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-4 lg:mt-0">
                        <button
                          className="btn btn-info btn-sm"
                          onClick={() => handleViewIssue(issue)}
                        >
                          <IoEye size={16} />
                          {t("view", "View")}
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleEditIssue(issue)}
                        >
                          <IoPencil size={16} />
                          {t("edit", "Edit")}
                        </button>
                        <button
                          className="btn btn-error btn-sm"
                          onClick={() => handleDeleteIssue(issue)}
                        >
                          <IoTrash size={16} />
                          {t("delete", "Delete")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "punch-list" && (
            <PunchListPanel projectId={selectedProject} />
          )}

          {/* Analytics */}
          {activeTab === "analytics" && (
            <div className="my-1">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{t("issue_analytics", "Issue Analytics")}</h2>
                  <p className="text-neutral-500">
                    {t("issue_analytics_desc", "Insights into issue patterns and resolution metrics")}
                  </p>
                </div>
                <div className="badge badge-info badge-lg">
                  {selectedProject
                    ? projects.find((p: Project) => p.id === selectedProject)
                        ?.name || t("project", "Project")
                    : t("all_projects", "All Projects")}
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="stat bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg">
                  <div className="stat-figure">
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="stat-title text-blue-100">{t("total_issues", "Total Issues")}</div>
                  <div className="stat-value">{filteredIssues.length}</div>
                  <div className="stat-desc text-blue-200">
                    {t("all_reported_issues", "All reported issues")}
                  </div>
                </div>

                <div className="stat bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl shadow-lg">
                  <div className="stat-figure">
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="stat-title text-red-100">{t("open_issues", "Open Issues")}</div>
                  <div className="stat-value">
                    {analyticsData.issuesByStatus.Open || 0}
                  </div>
                  <div className="stat-desc text-red-200">
                    {t("require_attention", "Require attention")}
                  </div>
                </div>

                <div className="stat bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl shadow-lg">
                  <div className="stat-figure">
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="stat-title text-amber-100">{t("in_progress", "In Progress")}</div>
                  <div className="stat-value">
                    {analyticsData.issuesByStatus["In Progress"] || 0}
                  </div>
                  <div className="stat-desc text-amber-200">
                    {t("being_worked_on", "Being worked on")}
                  </div>
                </div>

                <div className="stat bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg">
                  <div className="stat-figure">
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="stat-title text-green-100">{t("resolved", "Resolved")}</div>
                  <div className="stat-value">
                    {analyticsData.issuesByStatus.Resolved || 0}
                  </div>
                  <div className="stat-desc text-green-200">
                    {t("successfully_fixed", "Successfully fixed")}
                  </div>
                </div>
              </div>

              {/* Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Status Breakdown */}
                <div className="bg-base-100 rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4">{t("by_status", "By Status")}</h3>
                  <div className="space-y-3">
                    {Object.entries(analyticsData.issuesByStatus).map(
                      ([status, count]) => (
                        <div
                          key={status}
                          className="flex justify-between items-center"
                        >
                          <span className={`badge ${getStatusBadge(status)}`}>
                            {t(status.toLowerCase().replace(" ", "_"), status)}
                          </span>
                          <span className="font-bold">{count as number}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Severity Breakdown */}
                <div className="bg-base-100 rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4">{t("by_severity", "By Severity")}</h3>
                  <div className="space-y-3">
                    {Object.entries(analyticsData.issuesBySeverity).map(
                      ([severity, count]) => (
                        <div
                          key={severity}
                          className="flex justify-between items-center"
                        >
                          <span
                            className={`badge ${getSeverityBadge(severity)}`}
                          >
                            {t(severity.toLowerCase(), severity)}
                          </span>
                          <span className="font-bold">{count as number}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Category Breakdown */}
                <div className="bg-base-100 rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4">{t("by_category", "By Category")}</h3>
                  <div className="space-y-3">
                    {Object.entries(analyticsData.issuesByCategory).map(
                      ([category, count]) => (
                        <div
                          key={category}
                          className="flex justify-between items-center"
                        >
                          <span
                            className={`badge ${getCategoryBadge(category)}`}
                          >
                            {t("cat_" + category.toLowerCase(), category)}
                          </span>
                          <span className="font-bold">{count as number}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Issue Modal */}
      {showCreateIssueModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-lg">{t("report_new_issue", "Report New Issue")}</h3>
                {selectedProject && (
                  <p className="text-sm text-gray-500 mt-1">
                    {t("for_project", "For project: ")}{" "}
                    <span className="font-medium text-primary">
                      {projects.find((p: Project) => p.id === selectedProject)
                        ?.name || "Selected Project"}
                    </span>
                  </p>
                )}
              </div>
            </div>

            <form onSubmit={handleCreateIssue} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">{t("issue_title_required", "Issue Title *")}</span>
                </label>
                <input
                  type="text"
                  name="title"
                  className="input input-bordered"
                  placeholder={t("issue_title_placeholder", "Brief description of the issue...")}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">{t("description_required", "Description *")}</span>
                </label>
                <textarea
                  name="description"
                  className="textarea textarea-bordered h-24"
                  placeholder={t("description_placeholder", "Detailed description of the issue...")}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">{t("category_required", "Category *")}</span>
                  </label>
                  <select
                    name="category"
                    className="select select-bordered"
                    required
                  >
                    <option value="">{t("select_category", "Select category")}</option>
                    <option value={IssueCategory.SAFETY}>{t("cat_safety", "Safety")}</option>
                    <option value={IssueCategory.QUALITY}>{t("cat_quality", "Quality")}</option>
                    <option value={IssueCategory.DELAY}>{t("cat_delay", "Delay")}</option>
                    <option value={IssueCategory.EQUIPMENT}>{t("cat_equipment", "Equipment")}</option>
                    <option value={IssueCategory.ENVIRONMENTAL}>
                      {t("cat_environmental", "Environmental")}
                    </option>
                    <option value={IssueCategory.MATERIAL}>{t("cat_material", "Material")}</option>
                    <option value={IssueCategory.OTHER}>{t("cat_other", "Other")}</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">{t("severity_required", "Severity *")}</span>
                  </label>
                  <select
                    name="severity"
                    className="select select-bordered"
                    required
                  >
                    <option value="">{t("select_severity", "Select severity")}</option>
                    <option value={IssueSeverity.LOW}>{t("low", "Low")}</option>
                    <option value={IssueSeverity.MEDIUM}>{t("medium", "Medium")}</option>
                    <option value={IssueSeverity.HIGH}>{t("high", "High")}</option>
                    <option value={IssueSeverity.CRITICAL}>{t("critical", "Critical")}</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">{t("due_date", "Due Date")}</span>
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    className="input input-bordered"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              {/* Tag Users */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    {t("tag_users_label", "Tag Users (for notifications)")}
                  </span>
                </label>
                <div className="border border-base-300 rounded-lg p-3 min-h-[100px] max-h-32 overflow-y-auto">
                  <div className="space-y-2">
                    {projectUsers.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        {t("no_users_available_tagging", "No users available for tagging. Select a project first.")}
                      </p>
                    ) : (
                      projectUsers.map(
                        (userProject: {
                          user: {
                            id: number;
                            firstName: string;
                            lastName: string;
                            email: string;
                          };
                        }) => {
                          const user = userProject.user;
                          return (
                            <div
                              key={user.id}
                              className="flex items-center justify-between"
                            >
                              <span className="text-sm">
                                {user.firstName} {user.lastName} ({user.email})
                              </span>
                              {selectedTaggedUsers.includes(user.id) ? (
                                <button
                                  type="button"
                                  className="btn btn-error btn-xs"
                                  onClick={() =>
                                    handleRemoveTaggedUser(user.id)
                                  }
                                >
                                  {t("remove", "Remove")}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="btn btn-info btn-xs"
                                  onClick={() => handleAddTaggedUser(user.id)}
                                >
                                  {t("tag", "Tag")}
                                </button>
                              )}
                            </div>
                          );
                        }
                      )
                    )}
                  </div>
                </div>
                {selectedTaggedUsers.length > 0 && (
                  <div className="label">
                    <span className="label-text-alt text-info">
                      {t("tagged_count", "Tagged: ")}{selectedTaggedUsers.length} {t("users_parentheses", "user(s)")}
                    </span>
                  </div>
                )}
              </div>

              {/* File Upload */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">{t("attachments", "Attachments")}</span>
                </label>
                <input
                  type="file"
                  className="file-input file-input-bordered"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                />
                {uploadedFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {uploadedFiles.map((fileName, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-base-200 p-2 rounded"
                      >
                        <span className="text-sm">{fileName}</span>
                        <button
                          type="button"
                          className="btn btn-error btn-xs"
                          onClick={() => handleRemoveFile(fileName)}
                        >
                          <IoTrash size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setShowCreateIssueModal(false);
                    setSelectedTaggedUsers([]);
                    setUploadedFiles([]);
                  }}
                >
                  {t("cancel", "Cancel")}
                </button>
                <button type="submit" className="btn btn-primary">
                  {t("report_issue", "Report Issue")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Issue Modal */}
      {showEditIssueModal && editingIssue && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backdropFilter: "blur(4px)", background: "rgba(0,0,0,0.2)" }}
        >
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">{t("edit_issue", "Edit Issue")}</h3>

            <form onSubmit={handleUpdateIssue} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">
                      {t("issue_title_required", "Issue Title *")}
                    </span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    className="input input-bordered w-full"
                    defaultValue={editingIssue.title}
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t("status_required", "Status *")}</span>
                  </label>
                  <select
                    name="status"
                    className="select select-bordered w-full"
                    defaultValue={editingIssue.status}
                    required
                  >
                    <option value="Open">{t("open", "Open")}</option>
                    <option value="In Progress">{t("in_progress", "In Progress")}</option>
                    <option value="Resolved">{t("resolved", "Resolved")}</option>
                    <option value="Closed">{t("closed", "Closed")}</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">{t("description_required", "Description *")}</span>
                </label>
                <textarea
                  name="description"
                  className="textarea textarea-bordered w-full h-24"
                  defaultValue={editingIssue.description}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t("category_required", "Category *")}</span>
                  </label>
                  <select
                    name="category"
                    className="select select-bordered w-full"
                    defaultValue={editingIssue.category}
                    required
                  >
                    <option value={IssueCategory.SAFETY}>{t("cat_safety", "Safety")}</option>
                    <option value={IssueCategory.QUALITY}>{t("cat_quality", "Quality")}</option>
                    <option value={IssueCategory.DELAY}>{t("cat_delay", "Delay")}</option>
                    <option value={IssueCategory.EQUIPMENT}>{t("cat_equipment", "Equipment")}</option>
                    <option value={IssueCategory.ENVIRONMENTAL}>
                      {t("cat_environmental", "Environmental")}
                    </option>
                    <option value={IssueCategory.MATERIAL}>{t("cat_material", "Material")}</option>
                    <option value={IssueCategory.OTHER}>{t("cat_other", "Other")}</option>
                  </select>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t("severity_required", "Severity *")}</span>
                  </label>
                  <select
                    name="severity"
                    className="select select-bordered w-full"
                    defaultValue={editingIssue.severity}
                    required
                  >
                    <option value={IssueSeverity.LOW}>{t("low", "Low")}</option>
                    <option value={IssueSeverity.MEDIUM}>{t("medium", "Medium")}</option>
                    <option value={IssueSeverity.HIGH}>{t("high", "High")}</option>
                    <option value={IssueSeverity.CRITICAL}>{t("critical", "Critical")}</option>
                  </select>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t("due_date", "Due Date")}</span>
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    className="input input-bordered w-full"
                    defaultValue={
                      editingIssue.dueDate
                        ? new Date(editingIssue.dueDate)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                  />
                </div>
              </div>

              {/* Resolution field (if status is resolved) */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">{t("resolution", "Resolution")}</span>
                </label>
                <textarea
                  name="resolution"
                  className="textarea textarea-bordered w-full h-24"
                  placeholder={t("resolution_placeholder", "Describe how this issue was resolved...")}
                  defaultValue={editingIssue.resolution || ""}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowEditIssueModal(false);
                    setEditingIssue(null);
                    setEditSelectedTaggedUsers([]);
                  }}
                >
                  {t("cancel", "Cancel")}
                </button>
                <button type="submit" className="btn btn-primary">
                  {t("update_issue", "Update Issue")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Issue Modal */}
      {showViewIssueModal && viewingIssue && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backdropFilter: "blur(4px)", background: "rgba(0,0,0,0.2)" }}
        >
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">{t("issue_details", "Issue Details")}</h3>
              <button
                className="btn btn-circle btn-sm"
                onClick={() => setShowViewIssueModal(false)}
              >
                <IoClose size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="badge badge-neutral font-mono text-lg">
                  {viewingIssue.id}
                </span>
                <span
                  className={`badge ${getCategoryBadge(viewingIssue.category)}`}
                >
                  {t("cat_" + viewingIssue.category.toLowerCase(), viewingIssue.category)}
                </span>
                <span
                  className={`badge ${getSeverityBadge(viewingIssue.severity)}`}
                >
                  {t(viewingIssue.severity.toLowerCase(), viewingIssue.severity)}
                </span>
                <span
                  className={`badge ${getStatusBadge(viewingIssue.status)}`}
                >
                  {t(viewingIssue.status.toLowerCase().replace(" ", "_"), viewingIssue.status)}
                </span>
              </div>

              <div>
                <h4 className="font-semibold text-xl mb-2">
                  {viewingIssue.title}
                </h4>
                <p className="text-gray-700 mb-4">{viewingIssue.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">{t("project_id_colon", "Project ID:")}</span>{" "}
                  {viewingIssue.projectId}
                </div>
                <div>
                  <span className="font-medium">{t("reporter_colon", "Reporter:")}</span>{" "}
                  {viewingIssue.reporter?.firstName}{" "}
                  {viewingIssue.reporter?.lastName || viewingIssue.reportedBy}
                </div>
                {viewingIssue.location && (
                  <div>
                    <span className="font-medium">{t("location_colon", "Location: ")}</span>{" "}
                    {viewingIssue.location}
                  </div>
                )}
                <div>
                  <span className="font-medium">{t("created_colon", "Created:")}</span>{" "}
                  {new Date(viewingIssue.createdAt).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">{t("updated_colon", "Updated:")}</span>{" "}
                  {new Date(viewingIssue.updatedAt).toLocaleString()}
                </div>
                {viewingIssue.dueDate && (
                  <div>
                    <span className="font-medium">{t("due_date_colon", "Due Date:")}</span>{" "}
                    {new Date(viewingIssue.dueDate).toLocaleDateString()}
                  </div>
                )}
                {viewingIssue.resolvedAt && (
                  <div>
                    <span className="font-medium">{t("resolved_colon", "Resolved:")}</span>{" "}
                    {new Date(viewingIssue.resolvedAt).toLocaleString()}
                  </div>
                )}
              </div>

              {viewingIssue.taggedUsers &&
                viewingIssue.taggedUsers.length > 0 && (
                  <div>
                    <span className="font-medium">{t("tagged_users_colon", "Tagged users:")}</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {viewingIssue.taggedUsers.map((user) => (
                        <span key={user.id} className="badge badge-outline">
                          {user.firstName} {user.lastName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {viewingIssue.attachments &&
                viewingIssue.attachments.length > 0 && (
                  <div>
                    <span className="font-medium">{t("attachments", "Attachments")}:</span>
                    <div className="space-y-1 mt-1">
                      {viewingIssue.attachments.map((attachment, index) => (
                        <div
                          key={attachment.id || index}
                          className="badge badge-neutral"
                        >
                          <IoAttach size={14} className="mr-1" />
                          {attachment.name || `Attachment ${index + 1}`}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {viewingIssue.resolution && (
                <div className="bg-base-200 p-4 rounded-lg">
                  <span className="font-medium">{t("resolution", "Resolution")}:</span>
                  <p className="mt-1">{viewingIssue.resolution}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowViewIssueModal(false);
                  handleEditIssue(viewingIssue);
                }}
              >
                {t("edit_issue", "Edit Issue")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingIssue && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backdropFilter: "blur(4px)", background: "rgba(0,0,0,0.2)" }}
        >
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{t("confirm_deletion", "Confirm Deletion")}</h3>
            <p className="text-gray-700 mb-4">
              {t("confirm_delete_issue_desc", "Are you sure you want to delete this issue? This action cannot be undone.")}
            </p>
            <div className="text-sm text-gray-600 mb-4">
              <span className="font-medium">{t("issue_colon", "Issue:")}</span> {deletingIssue.title}
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="btn btn-outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingIssue(null);
                }}
              >
                {t("cancel", "Cancel")}
              </button>
              <button className="btn btn-error" onClick={confirmDeleteIssue}>
                {t("delete_issue", "Delete Issue")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueReporting;

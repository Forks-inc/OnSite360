import { useState } from "react";
import { useRoles } from "../hooks/useRoles";
import { useUsers, type User } from "../hooks/useUsers";
import { useUserProjects, useProjects, type Project, type UserProjectWithProject } from "../hooks/useProjects";
import { useTasks, useUserTaskStats, type Task } from "../hooks/useTasks";
import { useTranslation } from "../hooks/useTranslation";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// Interface for user project with embedded project data

const EmployeeManagement = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("All");
  
  // Fetch roles and users using the hooks
  const { data: roles, isLoading: rolesLoading } = useRoles();
  const { data: users, isLoading: usersLoading } = useUsers();
  
  // Fetch projects list to get project names
  const { data: allProjects } = useProjects();
  
  // Extract the actual projects data from the API response (same structure as userProjects)
  const actualProjects = allProjects?.data || allProjects || [];
  
  // Fetch user projects and tasks data for selected employee
  const { data: userProjects, isLoading: projectsLoading } = useUserProjects(
    selectedEmployee?.id || ""
  );
  const { data: userTasks, isLoading: tasksLoading } = useTasks(
    selectedEmployee ? { assigneeId: selectedEmployee.id } : undefined
  );
  const { data: userTaskStats, isLoading: taskStatsLoading } = useUserTaskStats();

  // Extract the actual user projects data from the API response
  const actualUserProjects = userProjects?.data || [];

  const handleViewEmployee = (employee: User) => {
    setSelectedEmployee(employee);
    setActiveTab("employee_details");
  };

  // Create role options from API data only
  const roleOptions = ["All"];
  if (roles && roles.length > 0) {
    const apiRoleNames = roles.map(role => role.name);
    roleOptions.push(...apiRoleNames);
  }
  
  // Use actual users data or empty array if loading
  const employees = users || [];
  
  const filteredEmployees = selectedRole === "All" 
    ? employees 
    : employees.filter(emp => emp.role?.name === selectedRole);

  // Calculate basic statistics from available user data
  const totalEmployees = employees.length;
  const isLoading = usersLoading || rolesLoading;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-1">{t("employees_title", "Employee Directory")}</h1>
      <p className="text-gray-500 mb-6">{t("employees_subtitle", "Internal user directories, contact information, and role structures")}</p>

      {/* Performance Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="stat bg-base-100 rounded-xl shadow border border-base-300">
          <div className="stat-title">{t("total_employees", "Total Employees")}</div>
          <div className="stat-value text-primary">{totalEmployees}</div>
          <div className="stat-desc">{totalEmployees} {t("users_registered", "users registered")}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow border border-base-300">
          <div className="stat-title">{t("active_roles", "Active Roles")}</div>
          <div className="stat-value text-success">{roles?.length || 0}</div>
          <div className="stat-desc">{t("available_positions", "Available positions")}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow border border-base-300">
          <div className="stat-title">{t("filtered_view", "Filtered View")}</div>
          <div className="stat-value text-warning">{filteredEmployees.length}</div>
          <div className="stat-desc">{t("currently_showing", "Currently showing")}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow border border-base-300">
          <div className="stat-title">{t("system_status", "System Status")}</div>
          <div className={`stat-value ${isLoading ? 'text-warning' : 'text-success'}`}>
            {isLoading ? t("loading", "Loading...") : t("ready", "Ready")}
          </div>
          <div className="stat-desc">{t("data_availability", "Data availability")}</div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="tabs tabs-border">
        <input
          type="radio"
          name="employee_tab_group"
          className="tab"
          aria-label={t("dashboard", "Dashboard")}
          checked={activeTab === "dashboard"}
          onChange={() => setActiveTab("dashboard")}
        />
        {activeTab === "dashboard" && (
          <div className="tab-content p-5">
            {/* Role Filter */}
            <div className="mb-4">
              <select 
                className="select select-bordered w-64" 
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                disabled={rolesLoading}
              >
                {rolesLoading ? (
                  <option>{t("loading_roles", "Loading roles...")}</option>
                ) : (
                  roleOptions.map(role => (
                    <option key={role} value={role}>
                      {role === "All" ? t("all_roles", "All Roles") : role}
                    </option>
                  ))
                )}
              </select>
              {rolesLoading && <span className="loading loading-spinner loading-sm ml-2"></span>}
            </div>

            {/* Employee Performance Grid */}
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
              <h2 className="text-2xl font-bold mb-2">{t("team_overview", "Team Overview")}</h2>
              <p className="text-neutral-500 mb-4">
                {t("team_overview_desc", "Employee directory and role assignments")}
              </p>

              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <span className="loading loading-spinner loading-lg"></span>
                  <span className="ml-2">{t("loading_employees", "Loading employees...")}</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEmployees.map((employee) => (
                    <div
                      key={employee.id}
                      className="flex flex-col lg:flex-row lg:items-center justify-between border border-base-300 bg-base-100 rounded-2xl p-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="font-semibold text-lg">
                            {employee.firstName} {employee.lastName}
                          </div>
                          <span className="badge badge-primary badge-sm">
                            {t("active", "Active")}
                          </span>
                        </div>
                        
                        <div className="text-gray-500 text-sm mb-2">
                          {employee.role?.name || t("no_role_assigned", "No role assigned")} • {employee.email}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium">{t("role", "Role")}:</span>
                            <div className="font-bold text-primary">
                              {employee.role?.name || t("unassigned", "Unassigned")}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">{t("email", "Email")}:</span>
                            <div className="font-bold text-info">
                              {employee.email}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">{t("user_id", "User ID:")}</span>
                            <div className="font-bold text-neutral">
                              {employee.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="badge badge-ghost badge-sm">
                            {t("role_id", "Role ID:")} {employee.roleId.slice(0, 8)}...
                          </span>
                          {employee.createdAt && (
                            <span className="badge badge-ghost badge-sm">
                              {t("joined", "Joined:")} {new Date(employee.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4 lg:mt-0">
                        <button 
                          className="btn btn-soft btn-accent btn-sm"
                          onClick={() => handleViewEmployee(employee)}
                        >
                          {t("view_details", "View Details")}
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {!isLoading && filteredEmployees.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">{t("no_employees_matching_criteria", "No employees found matching the selected criteria.")}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <input
          type="radio"
          name="employee_tab_group"
          className="tab"
          aria-label={t("employee_details", "Employee Details")}
          checked={activeTab === "employee_details"}
          onChange={() => setActiveTab("employee_details")}
        />
        {activeTab === "employee_details" && selectedEmployee && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h2>
                  <p className="text-neutral-500">{selectedEmployee.role?.name || t("no_role_assigned", "No role assigned")} • {selectedEmployee.email}</p>
                </div>
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => setActiveTab("dashboard")}
                >
                  {t("back_to_dashboard", "← Back to Dashboard")}
                </button>
              </div>

              {/* User Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="stat bg-base-100 rounded-xl shadow">
                  <div className="stat-title">{t("user_id", "User ID")}</div>
                  <div className="stat-value text-primary text-sm">
                    {selectedEmployee.id.slice(0, 12)}...
                  </div>
                  <div className="stat-desc">{t("unique_identifier", "Unique identifier")}</div>
                </div>
                <div className="stat bg-base-100 rounded-xl shadow">
                  <div className="stat-title">{t("role", "Role")}</div>
                  <div className="stat-value text-success text-lg">{selectedEmployee.role?.name || t("unassigned", "Unassigned")}</div>
                  <div className="stat-desc">{t("current_position", "Current position")}</div>
                </div>
                <div className="stat bg-base-100 rounded-xl shadow">
                  <div className="stat-title">{t("role_id", "Role ID")}</div>
                  <div className="stat-value text-info text-sm">{selectedEmployee.roleId.slice(0, 12)}...</div>
                  <div className="stat-desc">{t("role_identifier", "Role identifier")}</div>
                </div>
                <div className="stat bg-base-100 rounded-xl shadow">
                  <div className="stat-title">{t("member_since", "Member Since")}</div>
                  <div className="stat-value text-warning text-lg">
                    {selectedEmployee.createdAt ? new Date(selectedEmployee.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                  <div className="stat-desc">{t("join_date", "Join date")}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* User Details */}
                <div className="bg-base-100 rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-4">{t("user_information", "User Information")}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>{t("email", "Email")}:</span>
                      <span className="font-medium">{selectedEmployee.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("first_name", "First Name")}:</span>
                      <span className="font-medium">{selectedEmployee.firstName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("last_name", "Last Name")}:</span>
                      <span className="font-medium">{selectedEmployee.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("role", "Role")}:</span>
                      <span className="font-medium">{selectedEmployee.role?.name || t("no_role_assigned", "No role assigned")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("created", "Created")}:</span>
                      <span className="font-medium">
                        {selectedEmployee.createdAt ? new Date(selectedEmployee.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("updated_lbl", "Updated")}:</span>
                      <span className="font-medium">
                        {selectedEmployee.updatedAt ? new Date(selectedEmployee.updatedAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Role Permissions */}
                <div className="bg-base-100 rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-4">{t("role_permissions", "Role Permissions")}</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {selectedEmployee.role?.rolePermissions && selectedEmployee.role.rolePermissions.length > 0 ? (
                      selectedEmployee.role.rolePermissions.map((rolePermission, index) => (
                        <div key={index} className="border border-base-300 rounded-lg p-3">
                          <div className="font-medium">
                            {rolePermission.permission?.pageName || `Permission ${rolePermission.permissionId}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            {t("level", "Level:")} {rolePermission.level}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">{t("no_permissions_assigned", "No permissions assigned to this role.")}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* User Projects and Task Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* User Projects */}
                <div className="bg-base-100 rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    {t("user_projects", "User Projects")}
                    {projectsLoading && <span className="loading loading-spinner loading-sm"></span>}
                  </h3>
                  {projectsLoading ? (
                    <div className="text-center py-4">
                      <span className="loading loading-spinner loading-md"></span>
                      <p className="text-sm text-gray-500 mt-2">{t("loading_projects", "Loading projects...")}</p>
                    </div>
                  ) : actualUserProjects && actualUserProjects.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {actualUserProjects.map((userProject: UserProjectWithProject) => {
                        // The API now returns the project object directly in the userProject
                        const project = userProject.project;
                        return (
                        <div key={userProject.id} className="border border-base-300 rounded-lg p-3">
                          <div className="font-medium text-primary mb-1">
                            {project?.name || `Project ID: ${userProject.projectId.slice(0, 8)}...`}
                          </div>
                          <div className="text-sm text-gray-600">
                            {t("role", "Role")}: {userProject.projectRole || 'Not specified'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {t("access_level", "Access Level:")} {userProject.accessLevel || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {t("status", "Status")}: {userProject.isActive ? t("active", "Active") : t("inactive", "Inactive")}
                          </div>
                          {project?.type && (
                            <div className="text-sm text-gray-500">
                              {t("type", "Type")}: {project.type}
                            </div>
                          )}
                          {project?.budget && (
                            <div className="text-sm text-gray-500">
                              {t("budget", "Budget")}: ${project.budget.toLocaleString()}
                            </div>
                          )}
                          {userProject.hourlyRate && (
                            <div className="text-sm text-gray-500">
                              {t("rate", "Rate:")} ${userProject.hourlyRate}/hr
                            </div>
                          )}
                          {userProject.workSchedule && (
                            <div className="text-sm text-gray-500">
                              {t("schedule", "Schedule:")} {userProject.workSchedule}
                            </div>
                          )}
                          {userProject.assignedDate && (
                            <div className="text-sm text-gray-500">
                              {t("assigned", "Assigned:")} {new Date(userProject.assignedDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      {t("no_project_assignments_found", "No project assignments found for this user.")}
                    </p>
                  )}
                </div>

                {/* Task Performance */}
                <div className="bg-base-100 rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    {t("task_performance", "Task Performance")}
                    {tasksLoading && <span className="loading loading-spinner loading-sm"></span>}
                  </h3>
                  {tasksLoading ? (
                    <div className="text-center py-4">
                      <span className="loading loading-spinner loading-md"></span>
                      <p className="text-sm text-gray-500 mt-2">{t("loading_tasks", "Loading tasks...")}</p>
                    </div>
                  ) : userTasks && userTasks.length > 0 ? (
                    <div className="space-y-4">
                      {/* Task Statistics */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="stat bg-base-200 rounded-lg p-3">
                          <div className="stat-title text-xs">{t("total_tasks", "Total Tasks")}</div>
                          <div className="stat-value text-lg text-primary">{userTasks.length}</div>
                        </div>
                        <div className="stat bg-base-200 rounded-lg p-3">
                          <div className="stat-title text-xs">{t("completed", "Completed")}</div>
                          <div className="stat-value text-lg text-success">
                            {userTasks.filter(task => task.status === 'Completed').length}
                          </div>
                        </div>
                        <div className="stat bg-base-200 rounded-lg p-3">
                          <div className="stat-title text-xs">{t("in_progress", "In Progress")}</div>
                          <div className="stat-value text-lg text-warning">
                            {userTasks.filter(task => task.status === 'In Progress').length}
                          </div>
                        </div>
                        <div className="stat bg-base-200 rounded-lg p-3">
                          <div className="stat-title text-xs">{t("pending", "Pending")}</div>
                          <div className="stat-value text-lg text-info">
                            {userTasks.filter(task => task.status === 'Pending').length}
                          </div>
                        </div>
                      </div>

                      {/* Recent Tasks */}
                      <div>
                        <h4 className="font-medium mb-2">{t("recent_tasks", "Recent Tasks")}</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {userTasks.slice(0, 3).map((task: Task) => (
                            <div key={task.id} className="text-sm border border-base-300 rounded p-2">
                              <div className="font-medium">{task.title}</div>
                              <div className="flex justify-between text-xs text-gray-500">
                                <span className={`badge badge-xs ${
                                  task.status === 'Completed' ? 'badge-success' :
                                  task.status === 'In Progress' ? 'badge-warning' :
                                  task.status === 'Pending' ? 'badge-info' : 'badge-ghost'
                                }`}>
                                  {task.status === 'Completed' ? t("completed", "Completed") :
                                   task.status === 'In Progress' ? t("in_progress", "In Progress") :
                                   task.status === 'Pending' ? t("pending", "Pending") : task.status}
                                </span>
                                <span className={`badge badge-xs ${
                                  task.priority === 'Critical' ? 'badge-error' :
                                  task.priority === 'High' ? 'badge-warning' :
                                  task.priority === 'Medium' ? 'badge-info' : 'badge-ghost'
                                }`}>
                                  {task.priority === 'Critical' ? t("critical", "Critical") :
                                   task.priority === 'High' ? t("high", "High") :
                                   task.priority === 'Medium' ? t("medium", "Medium") :
                                   task.priority === 'Low' ? t("low", "Low") : task.priority}
                                </span>
                              </div>
                              {task.progress !== undefined && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {t("progress_lbl", "Progress:")} {task.progress}%
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      {t("no_tasks_assigned_user", "No tasks assigned to this user.")}
                    </p>
                  )}
                </div>
              </div>

              {/* Additional Analytics */}
              <div className="bg-base-100 rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  {t("performance_analytics", "Performance Analytics")}
                  {taskStatsLoading && <span className="loading loading-spinner loading-sm"></span>}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Project Engagement */}
                  <div className="stat bg-base-200 rounded-lg p-4">
                    <div className="stat-title">{t("project_engagement", "Project Engagement")}</div>
                    <div className="stat-value text-lg text-primary">
                      {projectsLoading ? '...' : actualUserProjects?.length || 0}
                    </div>
                    <div className="stat-desc">{t("active_projects", "Active projects")}</div>
                  </div>

                  {/* Task Completion Rate */}
                  <div className="stat bg-base-200 rounded-lg p-4">
                    <div className="stat-title">{t("completion_rate", "Completion Rate")}</div>
                    <div className="stat-value text-lg text-success">
                      {tasksLoading ? '...' : userTasks && userTasks.length > 0 
                        ? `${Math.round((userTasks.filter(task => task.status === 'Completed').length / userTasks.length) * 100)}%`
                        : '0%'
                      }
                    </div>
                    <div className="stat-desc">{t("tasks_completed", "Tasks completed")}</div>
                  </div>

                  {/* Average Progress */}
                  <div className="stat bg-base-200 rounded-lg p-4">
                    <div className="stat-title">{t("avg_progress", "Avg Progress")}</div>
                    <div className="stat-value text-lg text-info">
                      {tasksLoading ? '...' : userTasks && userTasks.length > 0
                        ? `${Math.round(userTasks.reduce((sum, task) => sum + (task.progress || 0), 0) / userTasks.length)}%`
                        : '0%'
                      }
                    </div>
                    <div className="stat-desc">{t("across_all_tasks", "Across all tasks")}</div>
                  </div>
                </div>

                {/* Global User Task Statistics */}
                {userTaskStats && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">{t("global_task_performance", "Global Task Performance")}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="stat bg-base-200 rounded-lg p-3">
                        <div className="stat-title text-xs">{t("total_tasks", "Total Tasks")}</div>
                        <div className="stat-value text-lg text-primary">{userTaskStats.totalTasks}</div>
                      </div>
                      <div className="stat bg-base-200 rounded-lg p-3">
                        <div className="stat-title text-xs">{t("completed", "Completed")}</div>
                        <div className="stat-value text-lg text-success">{userTaskStats.completedTasks}</div>
                      </div>
                      <div className="stat bg-base-200 rounded-lg p-3">
                        <div className="stat-title text-xs">{t("in_progress", "In Progress")}</div>
                        <div className="stat-value text-lg text-warning">{userTaskStats.inProgressTasks}</div>
                      </div>
                      <div className="stat bg-base-200 rounded-lg p-3">
                        <div className="stat-title text-xs">{t("overdue", "Overdue")}</div>
                        <div className="stat-value text-lg text-error">{userTaskStats.overdueTasks}</div>
                      </div>
                    </div>
                    
                    {userTaskStats.averageCompletionTime && (
                      <div className="mt-3">
                        <div className="stat bg-base-200 rounded-lg p-3">
                          <div className="stat-title text-xs">{t("avg_completion_time", "Avg Completion Time")}</div>
                          <div className="stat-value text-lg text-info">
                            {Math.round(userTaskStats.averageCompletionTime)} {t("days", "days")}
                          </div>
                          <div className="stat-desc">{t("avg_time_complete_tasks", "Average time to complete tasks")}</div>
                        </div>
                      </div>
                    )}
                    
                    {userTaskStats.totalHoursLogged && (
                      <div className="mt-3">
                        <div className="stat bg-base-200 rounded-lg p-3">
                          <div className="stat-title text-xs">{t("total_hours_logged", "Total Hours Logged")}</div>
                          <div className="stat-value text-lg text-accent">
                            {userTaskStats.totalHoursLogged} {t("hours_unit", "hrs")}
                          </div>
                          <div className="stat-desc">{t("across_all_tasks", "Across all tasks")}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Current Project Time Analytics */}
                {userTasks && userTasks.some(task => task.estimatedHours || task.actualHours) && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">{t("current_project_time_analytics", "Current Project Time Analytics")}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="stat bg-base-200 rounded-lg p-3">
                        <div className="stat-title text-xs">{t("total_estimated_hours", "Total Estimated Hours")}</div>
                        <div className="stat-value text-lg text-warning">
                          {userTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0)} {t("hours_unit", "hrs")}
                        </div>
                      </div>
                      <div className="stat bg-base-200 rounded-lg p-3">
                        <div className="stat-title text-xs">{t("total_actual_hours", "Total Actual Hours")}</div>
                        <div className="stat-value text-lg text-info">
                          {userTasks.reduce((sum, task) => sum + (task.actualHours || 0), 0)} {t("hours_unit", "hrs")}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <input
          type="radio"
          name="employee_tab_group"
          className="tab"
          aria-label={t("analytics", "Analytics")}
          checked={activeTab === "analytics"}
          onChange={() => setActiveTab("analytics")}
        />
        {activeTab === "analytics" && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
              <h2 className="text-2xl font-bold mb-2">{t("team_analytics", "Team Analytics")}</h2>
              <p className="text-neutral-500 mb-6">
                {t("team_analytics_subtitle", "Comprehensive workforce analytics and insights")}
              </p>
              
              {/* System Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-base-100 rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-4">{t("user_statistics", "User Statistics")}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>{t("total_users_lbl", "Total Users:")}</span>
                      <span className="font-bold text-primary">{employees.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("users_with_roles", "Users with Roles:")}</span>
                      <span className="font-bold text-success">
                        {employees.filter(emp => emp.role).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("unassigned_users", "Unassigned Users:")}</span>
                      <span className="font-bold text-warning">
                        {employees.filter(emp => !emp.role).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("total_roles_lbl", "Total Roles:")}</span>
                      <span className="font-bold text-info">{roles?.length || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-base-100 rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-4">{t("recent_activity", "Recent Activity")}</h3>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <span className="text-gray-500">{t("most_recent_user", "Most Recent User:")}</span>
                      <div className="font-medium">
                        {employees.length > 0 
                          ? `${employees[employees.length - 1]?.firstName} ${employees[employees.length - 1]?.lastName}`
                          : t("no_users_found", "No users found")
                        }
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">{t("system_status_lbl", "System Status:")}</span>
                      <div className="font-medium text-success">
                        {isLoading ? t("loading", "Loading...") : t("all_systems_operational", "All systems operational")}
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">{t("data_source", "Data Source:")}</span>
                      <div className="font-medium text-info">
                        {t("live_api_data", "Live API data")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project & Task Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Project Analytics */}
                <div className="bg-base-100 rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    {t("project_overview", "Project Overview")}
                    {actualProjects ? null : <span className="loading loading-spinner loading-sm"></span>}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>{t("total_projects_lbl", "Total Projects:")}</span>
                      <span className="font-bold text-primary">{actualProjects?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("active_projects_lbl", "Active Projects:")}</span>
                      <span className="font-bold text-success">
                        {actualProjects?.filter((project: Project) =>
                          !project.endDate || new Date(project.endDate) > new Date()
                        ).length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("projects_with_budgets", "Projects with Budgets:")}</span>
                      <span className="font-bold text-info">
                        {actualProjects?.filter((project: Project) => project.budget).length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("avg_project_size", "Avg Project Size:")}</span>
                      <span className="font-bold text-warning">
                        {actualProjects && actualProjects.length > 0 
                          ? `${Math.round(actualProjects.reduce((sum: number, project: Project) =>
                              sum + (project.squareFeet || 0), 0) / actualProjects.length).toLocaleString()} sq ft`
                          : '0 sq ft'
                        }
                      </span>
                    </div>
                  </div>
                  
                  {/* Project Types Distribution */}
                  {actualProjects && actualProjects.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">{t("project_types", "Project Types")}</h4>
                      <div className="space-y-2">
                        {(Array.from(new Set(actualProjects.map((p: Project) => p.type).filter(Boolean))) as string[]).map((type: string) => (
                          <div key={type} className="flex justify-between text-sm">
                            <span>{type}:</span>
                            <span className="font-medium">
                              {actualProjects.filter((p: Project) => p.type === type).length} {t("projects_unit", "projects")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Team Task Performance */}
                <div className="bg-base-100 rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    {t("team_task_performance", "Team Task Performance")}
                    {taskStatsLoading && <span className="loading loading-spinner loading-sm"></span>}
                  </h3>
                  {userTaskStats ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>{t("global_total_tasks", "Global Total Tasks:")}</span>
                        <span className="font-bold text-primary">{userTaskStats.totalTasks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("global_completed", "Global Completed:")}</span>
                        <span className="font-bold text-success">{userTaskStats.completedTasks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("global_in_progress", "Global In Progress:")}</span>
                        <span className="font-bold text-warning">{userTaskStats.inProgressTasks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("global_overdue", "Global Overdue:")}</span>
                        <span className="font-bold text-error">{userTaskStats.overdueTasks}</span>
                      </div>
                      
                      {userTaskStats.averageCompletionTime && (
                        <div className="flex justify-between">
                          <span>{t("avg_completion", "Avg Completion:")}</span>
                          <span className="font-bold text-info">
                            {Math.round(userTaskStats.averageCompletionTime)} {t("days", "days")}
                          </span>
                        </div>
                      )}
                      
                      {userTaskStats.totalHoursLogged && (
                        <div className="flex justify-between">
                          <span>{t("total_hours_logged_lbl", "Total Hours Logged:")}</span>
                          <span className="font-bold text-accent">
                            {userTaskStats.totalHoursLogged} {t("hours_unit", "hrs")}
                          </span>
                        </div>
                      )}
                      
                      {/* Team Performance Metrics */}
                      <div className="mt-4 pt-3 border-t border-base-300">
                        <h4 className="font-medium mb-2">{t("team_efficiency", "Team Efficiency")}</h4>
                        <div className="flex justify-between text-sm">
                          <span>{t("completion_rate_lbl", "Completion Rate:")}</span>
                          <span className="font-medium text-success">
                            {userTaskStats.totalTasks > 0 
                              ? `${Math.round((userTaskStats.completedTasks / userTaskStats.totalTasks) * 100)}%`
                              : '0%'
                            }
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>{t("on_time_performance_lbl", "On-Time Performance:")}</span>
                          <span className="font-medium text-info">
                            {userTaskStats.totalTasks > 0 
                              ? `${Math.round(((userTaskStats.totalTasks - userTaskStats.overdueTasks) / userTaskStats.totalTasks) * 100)}%`
                              : '0%'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <span className="text-gray-500">{t("loading_team_performance_data", "Loading team performance data...")}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* User-Project Assignment Analytics */}
              <div className="bg-base-100 rounded-xl p-4 mt-6">
                <h3 className="text-lg font-semibold mb-4">{t("employee_project_engagement", "Employee Project Engagement")}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="stat bg-base-200 rounded-lg p-3">
                    <div className="stat-title text-xs">{t("users_with_projects", "Users with Projects")}</div>
                    <div className="stat-value text-lg text-primary">
                      {employees.filter(emp => 
                        actualProjects?.some((project: Project) => 
                          project.userProjects?.some((up: { userId: string; id: string; projectRole: string; accessLevel: number; isActive: boolean; user: { id: string; firstName: string; lastName: string; email: string; }; }) => up.userId === emp.id)
                        )
                      ).length}
                    </div>
                    <div className="stat-desc">{t("active_assignments", "Active assignments")}</div>
                  </div>
                  <div className="stat bg-base-200 rounded-lg p-3">
                    <div className="stat-title text-xs">{t("unassigned_users_engagement", "Unassigned Users")}</div>
                    <div className="stat-value text-lg text-warning">
                      {employees.length - employees.filter(emp => 
                        actualProjects?.some((project: Project) => 
                          project.userProjects?.some((up: { userId: string; id: string; projectRole: string; accessLevel: number; isActive: boolean; user: { id: string; firstName: string; lastName: string; email: string; }; }) => up.userId === emp.id)
                        )
                      ).length}
                    </div>
                    <div className="stat-desc">{t("need_assignments", "Need assignments")}</div>
                  </div>
                  <div className="stat bg-base-200 rounded-lg p-3">
                    <div className="stat-title text-xs">{t("avg_projects_per_user", "Avg Projects/User")}</div>
                    <div className="stat-value text-lg text-info">
                      {employees.length > 0 && actualProjects 
                        ? Math.round((actualProjects.reduce((sum: number, project: Project) => 
                            sum + (project.userProjects?.length || 0), 0) / employees.length) * 10) / 10
                        : 0
                      }
                    </div>
                    <div className="stat-desc">{t("per_employee", "Per employee")}</div>
                  </div>
                  <div className="stat bg-base-200 rounded-lg p-3">
                    <div className="stat-title text-xs">{t("total_assignments", "Total Assignments")}</div>
                    <div className="stat-value text-lg text-accent">
                      {actualProjects?.reduce((sum: number, project: Project) => 
                        sum + (project.userProjects?.length || 0), 0) || 0
                      }
                    </div>
                    <div className="stat-desc">{t("across_all_projects", "Across all projects")}</div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Role Distribution Chart */}
                <div className="bg-base-100 rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-4">{t("role_distribution_chart", "Role Distribution Chart")}</h3>
                  <div className="h-64">
                    <Doughnut
                      data={{
                        labels: roleOptions.filter(role => role !== "All"),
                        datasets: [{
                          label: t("employees", "Employees"),
                          data: roleOptions.filter(role => role !== "All").map(role => 
                            employees.filter(emp => emp.role?.name === role).length
                          ),
                          backgroundColor: [
                            'rgba(59, 130, 246, 0.8)',
                            'rgba(16, 185, 129, 0.8)',
                            'rgba(245, 158, 11, 0.8)',
                            'rgba(239, 68, 68, 0.8)',
                            'rgba(139, 92, 246, 0.8)',
                            'rgba(236, 72, 153, 0.8)',
                            'rgba(6, 182, 212, 0.8)',
                            'rgba(34, 197, 94, 0.8)',
                          ],
                          borderColor: [
                            'rgba(59, 130, 246, 1)',
                            'rgba(16, 185, 129, 1)',
                            'rgba(245, 158, 11, 1)',
                            'rgba(239, 68, 68, 1)',
                            'rgba(139, 92, 246, 1)',
                            'rgba(236, 72, 153, 1)',
                            'rgba(6, 182, 212, 1)',
                            'rgba(34, 197, 94, 1)',
                          ],
                          borderWidth: 2
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                          },
                          title: {
                            display: true,
                            text: t("employee_distribution_by_role", "Employee Distribution by Role")
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Task Status Overview */}
                <div className="bg-base-100 rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-4">{t("task_status_overview", "Task Status Overview")}</h3>
                  {userTaskStats ? (
                    <div className="h-64">
                      <Bar
                        data={{
                          labels: [t("total", "Total"), t("completed", "Completed"), t("in_progress", "In Progress"), t("pending", "Pending"), t("overdue", "Overdue")],
                          datasets: [{
                            label: t("tasks", "Tasks"),
                            data: [
                              userTaskStats.totalTasks,
                              userTaskStats.completedTasks,
                              userTaskStats.inProgressTasks,
                              userTaskStats.pendingTasks,
                              userTaskStats.overdueTasks
                            ],
                            backgroundColor: [
                              'rgba(59, 130, 246, 0.8)',
                              'rgba(16, 185, 129, 0.8)',
                              'rgba(245, 158, 11, 0.8)',
                              'rgba(6, 182, 212, 0.8)',
                              'rgba(239, 68, 68, 0.8)',
                            ],
                            borderColor: [
                              'rgba(59, 130, 246, 1)',
                              'rgba(16, 185, 129, 1)',
                              'rgba(245, 158, 11, 1)',
                              'rgba(6, 182, 212, 1)',
                              'rgba(239, 68, 68, 1)',
                            ],
                            borderWidth: 2
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: false,
                            },
                            title: {
                              display: true,
                              text: t("global_task_status_distribution", "Global Task Status Distribution")
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true
                            }
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <span className="text-gray-500">{t("loading_task_data", "Loading task data...")}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Analytics Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Project Types Chart */}
                <div className="bg-base-100 rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-4">{t("project_types_distribution", "Project Types Distribution")}</h3>
                  {actualProjects && actualProjects.length > 0 ? (
                    <div className="h-64">
                      <Doughnut
                        data={{
                          labels: Array.from(new Set(actualProjects.map((p: Project) => p.type).filter(Boolean))) as string[],
                          datasets: [{
                            label: t("projects", "Projects"),
                            data: (Array.from(new Set(actualProjects.map((p: Project) => p.type).filter(Boolean))) as string[]).map(type =>
                              actualProjects.filter((p: Project) => p.type === type).length
                            ),
                            backgroundColor: [
                              'rgba(16, 185, 129, 0.8)',
                              'rgba(59, 130, 246, 0.8)',
                              'rgba(245, 158, 11, 0.8)',
                              'rgba(139, 92, 246, 0.8)',
                              'rgba(236, 72, 153, 0.8)',
                              'rgba(6, 182, 212, 0.8)',
                            ],
                            borderColor: [
                              'rgba(16, 185, 129, 1)',
                              'rgba(59, 130, 246, 1)',
                              'rgba(245, 158, 11, 1)',
                              'rgba(139, 92, 246, 1)',
                              'rgba(236, 72, 153, 1)',
                              'rgba(6, 182, 212, 1)',
                            ],
                            borderWidth: 2
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom',
                            },
                            title: {
                              display: true,
                              text: t("projects_by_type", "Projects by Type")
                            }
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <span className="text-gray-500">{t("no_project_data_available", "No project data available")}</span>
                    </div>
                  )}
                </div>

                {/* Project Status Chart */}
                <div className="bg-base-100 rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-4">{t("project_status_overview", "Project Status Overview")}</h3>
                  {actualProjects && actualProjects.length > 0 ? (
                    <div className="h-64">
                      <Bar
                        data={{
                          labels: [t("total_projects", "Total Projects"), t("active_projects", "Active Projects"), t("with_budgets", "With Budgets")],
                          datasets: [{
                            label: t("count", "Count"),
                            data: [
                              actualProjects.length,
                              actualProjects.filter((project: Project) =>
                                !project.endDate || new Date(project.endDate) > new Date()
                              ).length,
                              actualProjects.filter((project: Project) => project.budget).length
                            ],
                            backgroundColor: [
                              'rgba(59, 130, 246, 0.8)',
                              'rgba(16, 185, 129, 0.8)',
                              'rgba(245, 158, 11, 0.8)',
                            ],
                            borderColor: [
                              'rgba(59, 130, 246, 1)',
                              'rgba(16, 185, 129, 1)',
                              'rgba(245, 158, 11, 1)',
                            ],
                            borderWidth: 2
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: false,
                            },
                            title: {
                              display: true,
                              text: t("project_status_distribution", "Project Status Distribution")
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true
                            }
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <span className="text-gray-500">{t("no_project_data_available", "No project data available")}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Team Performance Metrics Chart */}
              <div className="bg-base-100 rounded-xl p-4 mt-6">
                <h3 className="text-lg font-semibold mb-4">{t("team_performance_metrics", "Team Performance Metrics")}</h3>
                {userTaskStats ? (
                  <div className="h-80">
                    <Line
                      data={{
                        labels: [t("team_completion_rate", "Team Completion Rate"), t("on_time_performance", "On-Time Performance"), t("active_projects_coverage", "Active Projects Coverage")],
                        datasets: [{
                          label: t("performance_percentage_lbl", "Performance %"),
                          data: [
                            userTaskStats.totalTasks > 0 
                              ? Math.round((userTaskStats.completedTasks / userTaskStats.totalTasks) * 100)
                              : 0,
                            userTaskStats.totalTasks > 0 
                              ? Math.round(((userTaskStats.totalTasks - userTaskStats.overdueTasks) / userTaskStats.totalTasks) * 100)
                              : 0,
                            actualProjects && employees.length > 0
                              ? Math.round((employees.filter(emp => 
                                  actualProjects.some((project: Project) => 
                                    project.userProjects?.some((up: { userId: string; id: string; projectRole: string; accessLevel: number; isActive: boolean; user: { id: string; firstName: string; lastName: string; email: string; }; }) => up.userId === emp.id)
                                  )
                                ).length / employees.length) * 100)
                              : 0
                          ],
                          borderColor: 'rgba(16, 185, 129, 1)',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          borderWidth: 3,
                          fill: true,
                          tension: 0.4,
                          pointBackgroundColor: 'rgba(16, 185, 129, 1)',
                          pointBorderColor: 'rgba(16, 185, 129, 1)',
                          pointRadius: 6,
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                          title: {
                            display: true,
                            text: t("overall_team_performance_indicators", "Overall Team Performance Indicators")
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                              callback: function(value) {
                                return value + '%';
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-80">
                    <span className="text-gray-500">{t("loading_performance_data", "Loading performance data...")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeManagement;

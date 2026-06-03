import { useState } from "react";
import { MdEdit, MdDelete } from "react-icons/md";
import Select from "react-select";
import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  type Role,
  type CreateRoleDto,
} from "../hooks/useRoles";
import { usePermissions } from "../hooks/usePermissions";
import { useTranslation } from "../hooks/useTranslation";

const RolesAndPermissions = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("current_user_roles");
  const [currentStep, setCurrentStep] = useState(1);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<
    { permissionId: string; level: number; availableComponents?: string[] }[]
  >([]);
  const [roleName, setRoleName] = useState("");

  const { data: roles, isLoading: rolesLoading } = useRoles();
  const { data: permissions } = usePermissions();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleName(role.name);
    // Convert rolePermissions to selectedPermissions format
    const permissions = role.rolePermissions.map((rp) => ({
      permissionId: rp.permissionId,
      level: rp.level,
      availableComponents: rp.availableComponents || [],
    }));
    setSelectedPermissions(permissions);
    setActiveTab("edit_role");
  };

  const handleDeleteRole = (id: string) => {
    if (window.confirm(t("confirm_delete_role", "Are you sure you want to delete this role?"))) {
      deleteRole.mutate(id, {
        onSuccess: () => {
          console.log(`Role with ID ${id} deleted successfully.`);
        },
        onError: (error) => {
          console.error("Failed to delete role:", error);
        },
      });
    }
  };

  const handleCreateRole = () => {
    if (!roleName.trim()) {
      alert(t("role_name_required_alert", "Please enter a role name"));
      return;
    }

    const newRole: CreateRoleDto = {
      name: roleName,
      permissions: selectedPermissions,
    };

    createRole.mutate(newRole, {
      onSuccess: () => {
        console.log("Role created successfully!");
        setActiveTab("current_user_roles");
        setRoleName("");
        setSelectedPermissions([]);
        setCurrentStep(1);
      },
      onError: (error) => {
        console.error("Failed to create role:", error);
      },
    });
  };

  const handleUpdateRole = () => {
    if (!editingRole || !roleName.trim()) {
      alert(t("role_name_required_alert", "Please enter a role name"));
      return;
    }

    updateRole.mutate(
      {
        id: editingRole.id,
        role: {
          name: roleName,
          permissions: selectedPermissions,
        },
      },
      {
        onSuccess: () => {
          console.log("Role updated successfully!");
          setActiveTab("current_user_roles");
          setEditingRole(null);
          setRoleName("");
          setSelectedPermissions([]);
        },
        onError: (error) => {
          console.error("Failed to update role:", error);
        },
      }
    );
  };

  const handleComponentsChange = (
    permissionId: string,
    components: string[]
  ) => {
    setSelectedPermissions((prev) => {
      const updated = prev.map((p) =>
        p.permissionId === permissionId
          ? { ...p, availableComponents: components }
          : p
      );
      return updated;
    });
  };

  const handlePermissionToggle = (permissionId: string, level: number) => {
    console.log("Toggling permission:", permissionId, "level:", level);

    setSelectedPermissions((prev) => {
      const existing = prev.find((p) => p.permissionId === permissionId);
      if (existing) {
        if (existing.level === level) {
          // Remove permission if same level clicked
          const updated = prev.filter((p) => p.permissionId !== permissionId);
          console.log("Removing permission, new array:", updated);
          return updated;
        } else {
          // Update level
          const updated = prev.map((p) =>
            p.permissionId === permissionId ? { ...p, level } : p
          );
          console.log("Updating permission level, new array:", updated);
          return updated;
        }
      } else {
        const updated = [
          ...prev,
          { permissionId, level, availableComponents: [] },
        ];
        console.log("Adding new permission, new array:", updated);
        return updated;
      }
    });
  };

  return (
    <div className="p-8">
      {/* Heading */}
      <h1 className="text-3xl font-bold mb-1">{t("roles_management_title", "User Roles Management")}</h1>
      <p className="text-gray-500 mb-6">
        {t("roles_management_subtitle", "Configure user roles and module permissions")}
      </p>

      {/* Tabs navigation */}
      <div className="tabs tabs-border">
        <input
          type="radio"
          name="roles_tab_group"
          className="tab"
          aria-label={t("current_user_roles", "Current User Roles")}
          checked={activeTab === "current_user_roles"}
          onChange={() => setActiveTab("current_user_roles")}
        />
        {activeTab === "current_user_roles" && (
          <div className="tab-content p-5">
            {/* Tab content 1 */}
            {/* Roles & Permissions Section */}
            <div className="">
              {rolesLoading ? (
                <div className="flex justify-center">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {roles && roles.length > 0 ? (
                    roles.map((role) => (
                      <div
                        key={role.id}
                        className="bg-base-200 border border-base-300 rounded-2xl p-2  flex flex-col gap-3 relative"
                      >
                        <div className="flex flex-col gap-1 bg-base-100 rounded-2xl p-3">
                          <div className="absolute top-4 right-4 bg-warning text-warning-content text-xs rounded-full px-3 py-1 font-semibold">
                            {role.rolePermissions.length} {t("permissions_count_lbl", "permissions")}
                          </div>
                          <div className="text-lg font-semibold">
                            {role.name}
                          </div>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {role.rolePermissions.length > 0 ? (
                              role.rolePermissions.map((rolePermission) => (
                                <span
                                  key={rolePermission.id}
                                  className="badge badge-neutral text-sm"
                                  title={`Permission: ${
                                    rolePermission.permission?.pageName ||
                                    "Unknown"
                                  }`}
                                >
                                  {rolePermission.permission?.pageName ||
                                    rolePermission.permissionId.slice(0, 8)}
                                  <span className="ml-1 text-xs">
                                    (L{rolePermission.level})
                                  </span>
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-gray-500 italic">
                                {t("no_permissions_assigned", "No permissions assigned")}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <div className="btn-group">
                            <button
                              className="btn bg-black btn-sm w-max text-white"
                              onClick={() => handleEditRole(role)}
                            >
                              <MdEdit />
                            </button>
                            <button
                              className="btn bg-black btn-sm w-max text-white"
                              onClick={() => handleDeleteRole(role.id)}
                              disabled={deleteRole.isPending}
                            >
                              <MdDelete />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center text-gray-500 py-8">
                      {t("no_roles_found", "No roles found. Create your first role to get started.")}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create user role */}
        <input
          type="radio"
          name="roles_tab_group"
          className="tab"
          aria-label={t("create_user_role", "Create User Role")}
          checked={activeTab === "create_user_role"}
          onChange={() => setActiveTab("create_user_role")}
        />
        {activeTab === "create_user_role" && (
          <div className="tab-content flex gap-2 p-5 w-full">
            <div className="flex gap-2">
              {/* Steps */}
              <div className="flex flex-col w-1/3 gap-2 bg-base-200 rounded-2xl border border-base-300 p-2">
                {/* Step 01 */}
                <div
                  className={`w-full rounded-2xl p-5 cursor-pointer ${
                    currentStep === 1
                      ? "bg-primary text-primary-content"
                      : "bg-base-100"
                  }`}
                  onClick={() => setCurrentStep(1)}
                >
                  <p className="text-xs">{t("step_lbl", "Step")} 01</p>
                  <h1 className="font-semibold">{t("specify_role_details", "Specify Role Details")}</h1>
                </div>
                {/* Step 02 */}
                <div
                  className={`w-full rounded-2xl p-5 cursor-pointer ${
                    currentStep === 2
                      ? "bg-primary text-primary-content"
                      : "bg-base-100"
                  }`}
                  onClick={() => setCurrentStep(2)}
                >
                  <p className="text-xs">{t("step_lbl", "Step")} 02</p>
                  <h1 className="font-semibold">{t("set_permissions", "Set Permissions")}</h1>
                </div>
                {/* Step 03 */}
                <div
                  className={`w-full rounded-2xl p-5 cursor-pointer ${
                    currentStep === 3
                      ? "bg-primary text-primary-content"
                      : "bg-base-100"
                  }`}
                  onClick={() => setCurrentStep(3)}
                >
                  <p className="text-xs">{t("step_lbl", "Step")} 03</p>
                  <h1 className="font-semibold">{t("review_and_create", "Review and Create")}</h1>
                </div>
              </div>

              {/* User roles Details Form */}
              {currentStep === 1 && (
                <div className="w-full bg-base-200 rounded-2xl p-6 border border-base-300">
                  <h2 className="text-xl font-semibold mb-4">{t("role_details", "Role Details")}</h2>
                  <form className="flex flex-col gap-4">
                    <div>
                      <label className="label">
                        <span className="label-text font-medium">
                          {t("role_name_label", "Role Name")}
                        </span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        placeholder={t("enter_role_name_placeholder", "Enter role name")}
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
                        maxLength={64}
                      />
                      <span className="text-xs text-gray-500 mt-1 block">
                        {t("role_name_helper_text", "The role name can have up to 64 characters. Use descriptive names like \"Project Manager\" or \"Site Supervisor\"")}
                      </span>
                    </div>

                    <div className="bg-base-100 border border-info rounded-lg p-3 flex items-start gap-2">
                      <span className="text-info">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="inline w-5 h-5 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
                          />
                        </svg>
                      </span>
                      <span className="text-xs text-gray-700">
                        {t("role_assigned_help", "After creating the role, you'll be able to assign it to users in the User Management section. Roles define what permissions users have across different parts of the system.")}
                      </span>
                    </div>
                    <div className="flex justify-end mt-4">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setCurrentStep(2)}
                        disabled={!roleName.trim()}
                      >
                        {t("next_set_permissions", "Next: Set Permissions")}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Assign Permissions */}
              {currentStep === 2 && (
                <div className="w-full bg-base-200 rounded-2xl p-6 border border-base-300">
                  <h2 className="text-xl font-semibold mb-4">
                    {t("set_permissions", "Set Permissions")}
                  </h2>
                  <div className="flex flex-col gap-4">
                    <div className="bg-base-100 border border-info rounded-lg p-3">
                      <p className="text-sm text-gray-700">
                        {t("set_permissions_desc", "Select permissions for this role. Each permission can have different access levels (1-5). Higher levels typically grant more access. For permissions, you can also specify which components are available.")}
                      </p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="table w-full">
                        <thead>
                          <tr>
                            <th>{t("permission_th", "Permission")}</th>
                            <th>{t("page_th", "Page")}</th>
                            <th>{t("access_level_components_th", "Access Level / Components")}</th>
                            <th>{t("action_th", "Action")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {permissions && permissions.length > 0 ? (
                            permissions.map((permission) => {
                              const selectedPermission =
                                selectedPermissions.find(
                                  (sp) => sp.permissionId === permission.id
                                );
                              return (
                                <tr key={permission.id}>
                                  <td className="font-medium">
                                    {permission.pageName}
                                  </td>
                                  <td className="text-sm text-gray-500">
                                    {permission.pageId}
                                  </td>
                                  <td>
                                    <div className="flex flex-col gap-2">
                                      <select
                                        className="select select-bordered select-sm w-full max-w-xs"
                                        value={selectedPermission?.level || ""}
                                        onChange={(e) => {
                                          const level = parseInt(
                                            e.target.value
                                          );
                                          if (level) {
                                            handlePermissionToggle(
                                              permission.id,
                                              level
                                            );
                                          }
                                        }}
                                      >
                                        <option value="0">{t("no_access", "No Access")}</option>
                                        <option value="1">
                                          {t("level_1_readonly", "Level 1 (Read Only)")}
                                        </option>
                                        <option value="2">
                                          {t("level_2_readwrite", "Level 2 (Read/Write)")}
                                        </option>
                                        <option value="3">
                                          {t("level_3_admin", "Level 3 (Admin Access)")}
                                        </option>
                                      </select>
                                      {selectedPermission && (
                                        <div>
                                          <Select
                                            isMulti
                                            name="components"
                                            options={
                                              permission.components?.map(
                                                (comp) => ({
                                                  value: comp,
                                                  label: comp,
                                                })
                                              ) || []
                                            }
                                            value={
                                              selectedPermission.availableComponents?.map(
                                                (comp) => ({
                                                  value: comp,
                                                  label: comp,
                                                })
                                              ) || []
                                            }
                                            onChange={(selectedOptions) =>
                                              handleComponentsChange(
                                                permission.id,
                                                selectedOptions.map(
                                                  (option) => option.value
                                                )
                                              )
                                            }
                                            className="basic-multi-select"
                                            classNamePrefix="select"
                                            placeholder={t("select_components_placeholder", "Select components...")}
                                          />
                                          <div className="text-xs text-gray-500 mt-1">
                                            {t("select_components_helper", "Select components")}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td>
                                    <button
                                      type="button"
                                      className={`btn btn-sm ${
                                        selectedPermission
                                          ? "btn-error"
                                          : "btn-success"
                                      }`}
                                      onClick={() => {
                                        if (selectedPermission) {
                                          setSelectedPermissions((prev) =>
                                            prev.filter(
                                              (p) =>
                                                p.permissionId !== permission.id
                                            )
                                          );
                                        } else {
                                          handlePermissionToggle(
                                            permission.id,
                                            1
                                          );
                                        }
                                      }}
                                    >
                                      {selectedPermission ? t("remove", "Remove") : t("add", "Add")}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td
                                colSpan={4}
                                className="text-center text-gray-500"
                              >
                                {t("no_permissions_available", "No permissions available. Create permissions first.")}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-between">
                      <button
                        className="btn btn-neutral"
                        onClick={() => setCurrentStep(1)}
                      >
                        {t("previous", "Previous")}
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => setCurrentStep(3)}
                        disabled={selectedPermissions.length === 0}
                      >
                        {t("next_review", "Next: Review")}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Review choices */}
              {currentStep === 3 && (
                <div className="w-full bg-base-200 rounded-2xl p-6 border border-base-300">
                  <h2 className="text-xl font-semibold">
                    {t("review_and_create_role", "Review and Create Role")}
                  </h2>
                  <p className="text-base-content text-xs mb-6">
                    {t("review_create_role_desc", "Review the role details and permissions before creating the role.")}
                  </p>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">{t("role_details", "Role Details")}</h3>
                    <div className="overflow-x-auto">
                      <table className="table w-full bg-base-100">
                        <thead>
                          <tr>
                            <th>{t("role_name_label", "Role Name")}</th>
                            <th>{t("number_permissions_th", "Number of Permissions")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="font-semibold">{roleName}</td>
                            <td>
                              <span className="badge badge-primary">
                                {selectedPermissions.length} {t("permissions_count_lbl", "permissions")}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">
                      {t("permissions_summary", "Permissions Summary")}
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="table w-full bg-base-100">
                        <thead>
                          <tr>
                            <th>{t("permission_th", "Permission")}</th>
                            <th>{t("page_th", "Page")}</th>
                            <th>{t("access_level", "Access Level")}</th>
                            <th>{t("components", "Components")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedPermissions.length > 0 ? (
                            selectedPermissions.map((sp) => {
                              const permission = permissions?.find(
                                (p) => p.id === sp.permissionId
                              );
                              return (
                                <tr key={sp.permissionId}>
                                  <td className="font-medium">
                                    {permission?.pageName ||
                                      "Unknown Permission"}
                                  </td>
                                  <td className="text-sm text-gray-500">
                                    {permission?.pageId || "Unknown Page"}
                                  </td>
                                  <td>
                                    <span className="badge badge-success">
                                      Level {sp.level}
                                    </span>
                                  </td>
                                  <td>
                                    <div className="text-xs bg-base-200 p-2 rounded max-w-xs overflow-hidden">
                                      {sp.availableComponents?.join(", ") ||
                                        t("none", "None")}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td
                                colSpan={4}
                                className="text-center text-gray-500"
                              >
                                {t("no_permissions_selected", "No permissions selected")}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <button
                      className="btn btn-neutral"
                      onClick={() => setCurrentStep(2)}
                    >
                      {t("back_to_permissions", "Back to Permissions")}
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleCreateRole}
                      disabled={
                        createRole.isPending ||
                        !roleName.trim() ||
                        selectedPermissions.length === 0
                      }
                    >
                      {createRole.isPending ? t("creating", "Creating...") : t("create_role", "Create Role")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Role */}
        <input
          type="radio"
          name="roles_tab_group"
          className="tab"
          aria-label={t("edit_role", "Edit Role")}
          checked={activeTab === "edit_role"}
          onChange={() => setActiveTab("edit_role")}
        />
        {activeTab === "edit_role" && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl w-full">
              <h2 className="text-2xl font-bold mb-1">{t("edit_role", "Edit Role")}</h2>
              <p className="text-neutral-500 mb-6">
                {t("modify_role_desc", "Modify role details and permissions.")}
              </p>
              {editingRole ? (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="label">
                      <span className="label-text font-medium">{t("role_name_label", "Role Name")}</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                      placeholder={t("enter_role_name_placeholder", "Enter role name")}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">{t("permissions", "Permissions")}</h3>
                    <div className="overflow-x-auto">
                      <table className="table w-full">
                        <thead>
                          <tr>
                            <th>{t("permission_th", "Permission")}</th>
                            <th>{t("page_th", "Page")}</th>
                            <th>{t("access_level_components_th", "Access Level / Components")}</th>
                            <th>{t("action_th", "Action")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {permissions && permissions.length > 0 ? (
                            permissions.map((permission) => {
                              const selectedPermission =
                                selectedPermissions.find(
                                  (sp) => sp.permissionId === permission.id
                                );
                              return (
                                <tr key={permission.id}>
                                  <td className="font-medium">
                                    {permission.pageName}
                                  </td>
                                  <td className="text-sm text-gray-500">
                                    {permission.pageId}
                                  </td>
                                  <td>
                                    <div className="flex flex-col gap-2">
                                      <select
                                        className="select select-bordered select-sm w-full max-w-xs"
                                        value={selectedPermission?.level || ""}
                                        onChange={(e) => {
                                          const level = parseInt(
                                            e.target.value
                                          );
                                          if (level) {
                                            handlePermissionToggle(
                                              permission.id,
                                              level
                                            );
                                          }
                                        }}
                                      >
                                        <option value="0">{t("no_access", "No Access")}</option>
                                        <option value="1">
                                          {t("level_1_readonly", "Level 1 (Read Only)")}
                                        </option>
                                        <option value="2">
                                          {t("level_2_readwrite", "Level 2 (Read/Write)")}
                                        </option>
                                        <option value="3">
                                          {t("level_3_admin", "Level 3 (Admin Access)")}
                                        </option>
                                      </select>
                                      {selectedPermission && (
                                        <div>
                                          <Select
                                            isMulti
                                            name="components"
                                            options={
                                              permission.components?.map(
                                                (comp) => ({
                                                  value: comp,
                                                  label: comp,
                                                })
                                              ) || []
                                            }
                                            value={
                                              selectedPermission.availableComponents?.map(
                                                (comp) => ({
                                                  value: comp,
                                                  label: comp,
                                                })
                                              ) || []
                                            }
                                            onChange={(selectedOptions) =>
                                              handleComponentsChange(
                                                permission.id,
                                                selectedOptions.map(
                                                  (option) => option.value
                                                )
                                              )
                                            }
                                            className="basic-multi-select"
                                            classNamePrefix="select"
                                            placeholder={t("select_components_placeholder", "Select components...")}
                                          />
                                          <div className="text-xs text-gray-500 mt-1">
                                            {t("select_components_helper", "Select components")}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td>
                                    <button
                                      type="button"
                                      className={`btn btn-sm ${
                                        selectedPermission
                                          ? "btn-error"
                                          : "btn-success"
                                      }`}
                                      onClick={() => {
                                        if (selectedPermission) {
                                          setSelectedPermissions((prev) =>
                                            prev.filter(
                                              (p) =>
                                                p.permissionId !== permission.id
                                            )
                                          );
                                        } else {
                                          handlePermissionToggle(
                                            permission.id,
                                            1
                                          );
                                        }
                                      }}
                                    >
                                      {selectedPermission ? t("remove", "Remove") : t("add", "Add")}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td
                                colSpan={4}
                                className="text-center text-gray-500"
                              >
                                {t("no_permissions_available", "No permissions available. Create permissions first.")}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => {
                        setActiveTab("current_user_roles");
                        setEditingRole(null);
                        setRoleName("");
                        setSelectedPermissions([]);
                      }}
                    >
                      {t("cancel", "Cancel")}
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleUpdateRole}
                      disabled={
                        updateRole.isPending ||
                        !roleName.trim() ||
                        selectedPermissions.length === 0
                      }
                    >
                      {updateRole.isPending ? t("updating", "Updating...") : t("update_role", "Update Role")}
                    </button>
                  </div>
                </div>
              ) : (
                <p>{t("no_role_selected_edit", "No role selected for editing.")}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RolesAndPermissions;

import { useState } from "react";
import {
  usePermissions,
  useCreatePermission,
  useUpdatePermission,
  useDeletePermission,
  type Permission,
  type CreatePermissionDto,
} from "../hooks/usePermissions";
import { useTranslation } from "../hooks/useTranslation";

const PermissionManagement = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("permissions");
  const [editingPermission, setEditingPermission] = useState<Permission | null>(
    null
  );
  const [formData, setFormData] = useState<{
    pageId: string;
    pageName: string;
    components: string[];
  }>({
    pageId: "",
    pageName: "",
    components: [],
  });
  const [newComponent, setNewComponent] = useState("");
  const [editComponent, setEditComponent] = useState("");

  const { data: permissions, isLoading: permissionsLoading } = usePermissions();
  const createPermission = useCreatePermission();
  const updatePermission = useUpdatePermission();
  const deletePermission = useDeletePermission();

  const handleEditPermission = (permission: Permission) => {
    setEditingPermission(permission);
    setFormData({
      pageId: permission.pageId,
      pageName: permission.pageName,
      components: permission.components,
    });
    setActiveTab("edit_permission");
  };

  const handleDeletePermission = (id: string) => {
    if (
      window.confirm(
        t("confirm_delete_permission_desc", "Are you sure you want to delete this permission? This action cannot be undone.")
      )
    ) {
      deletePermission.mutate(id, {
        onSuccess: () => {
          console.log(`Permission with ID ${id} deleted successfully.`);
        },
        onError: (error) => {
          console.error("Failed to delete permission:", error);
          alert(t("failed_delete_permission", "Failed to delete permission. Please try again."));
        },
      });
    }
  };

  const handleCreatePermission = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validate required fields
    if (!formData.pageId.trim() || !formData.pageName.trim()) {
      alert(t("fill_required_fields", "Please fill in all required fields."));
      return;
    }

    const newPermission: CreatePermissionDto = {
      pageId: formData.pageId.trim(),
      pageName: formData.pageName.trim(),
      components: formData.components,
    };

    createPermission.mutate(newPermission, {
      onSuccess: () => {
        console.log("Permission created successfully!");
        setActiveTab("permissions");
        setFormData({ pageId: "", pageName: "", components: [] });
        setNewComponent("");
      },
      onError: (error) => {
        console.error("Failed to create permission:", error);
        alert(t("failed_create_permission", "Failed to create permission. Please try again."));
      },
    });
  };

  const handleUpdatePermission = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingPermission) return;

    // Validate required fields
    if (!formData.pageId.trim() || !formData.pageName.trim()) {
      alert(t("fill_required_fields", "Please fill in all required fields."));
      return;
    }

    const updatedPermission = {
      pageId: formData.pageId.trim(),
      pageName: formData.pageName.trim(),
      components: formData.components,
    };

    updatePermission.mutate(
      { id: editingPermission.id, permission: updatedPermission },
      {
        onSuccess: () => {
          console.log("Permission updated successfully!");
          setActiveTab("permissions");
          setEditingPermission(null);
          setFormData({ pageId: "", pageName: "", components: [] });
          setEditComponent("");
        },
        onError: (error) => {
          console.error("Failed to update permission:", error);
          alert(t("failed_update_permission", "Failed to update permission. Please try again."));
        },
      }
    );
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCancel = () => {
    setActiveTab("permissions");
    setEditingPermission(null);
    setFormData({ pageId: "", pageName: "", components: [] });
    setNewComponent("");
    setEditComponent("");
  };

  // Add a helper to reset form when switching tabs
  const switchToTab = (tab: string) => {
    setActiveTab(tab);
    if (tab === "add_permission") {
      setFormData({
        pageId: "",
        pageName: "",
        components: [],
      });
      setNewComponent("");
    }
  };

  const addComponent = (componentInput: string, isEditing: boolean = false) => {
    const trimmedComponent = componentInput.trim();
    if (!trimmedComponent) return;

    // Check for duplicates
    if (formData.components.includes(trimmedComponent)) {
      alert(t("component_exists", "This component already exists."));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      components: [...prev.components, trimmedComponent],
    }));

    // Clear the input
    if (isEditing) {
      setEditComponent("");
    } else {
      setNewComponent("");
    }
  };

  const removeComponent = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      components: prev.components.filter((_, i) => i !== index),
    }));
  };

  const handleComponentKeyPress = (e: React.KeyboardEvent, isEditing: boolean = false) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addComponent(isEditing ? editComponent : newComponent, isEditing);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-1">{t("permission_management_title", "Permission Management")}</h1>
      <p className="text-gray-500 mb-6">
        {t("permission_management_subtitle", "Manage page permissions and access controls")}
      </p>

      {/* Tabs navigation */}
      <div className="tabs tabs-border">
        <input
          type="radio"
          name="permission_tab_group"
          className="tab"
          aria-label={t("permissions", "Permissions")}
          checked={activeTab === "permissions"}
          onChange={() => switchToTab("permissions")}
        />
        {activeTab === "permissions" && (
          <div className="tab-content p-5">
            {/* Permissions List Section */}
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
              <h2 className="text-2xl font-bold">{t("permissions", "Permissions")}</h2>
              <p className="text-neutral-500 mb-4">
                {t("manage_page_permissions_desc", "Manage page permissions and component access")}
              </p>

              <div className="space-y-4">
                {permissionsLoading ? (
                  <div className="flex justify-center">
                    <span className="loading loading-spinner loading-lg"></span>
                  </div>
                ) : permissions && permissions.length > 0 ? (
                  permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="bg-base-100 border border-base-300 p-4 rounded-lg shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-primary">
                            {permission.pageName}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">
                            {t("page_id", "Page ID:")}{" "}
                            <span className="font-mono">{permission.pageId}</span>
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => handleEditPermission(permission)}
                            disabled={updatePermission.isPending}
                          >
                            {t("edit", "Edit")}
                          </button>
                          <button
                            className="btn btn-error btn-sm"
                            onClick={() => handleDeletePermission(permission.id)}
                            disabled={deletePermission.isPending}
                          >
                            {deletePermission.isPending ? (
                              <>
                                <span className="loading loading-spinner loading-xs"></span>
                                {t("deleting", "Deleting...")}
                              </>
                            ) : (
                              t("delete", "Delete")
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          {t("components_lbl", "Components:")}
                        </p>
                        {permission.components && permission.components.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {permission.components.map((component, index) => (
                              <span
                                key={index}
                                className="badge badge-outline badge-sm"
                              >
                                {component}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            {t("no_components_assigned", "No components assigned")}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    {t("no_permissions_found", "No permissions found. Create your first permission to get started.")}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <input
          type="radio"
          name="permission_tab_group"
          className="tab"
          aria-label={t("add_permission", "Add Permission")}
          checked={activeTab === "add_permission"}
          onChange={() => switchToTab("add_permission")}
        />
        {activeTab === "add_permission" && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl w-full">
              <h2 className="text-2xl font-bold mb-1">{t("add_new_permission", "Add New Permission")}</h2>
              <p className="text-neutral-500 mb-6">
                {t("create_new_permission_desc", "Create a new permission for page access and components.")}
              </p>
              <form
                className="flex flex-col gap-4"
                onSubmit={handleCreatePermission}
              >
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="label">
                      <span className="label-text font-medium">{t("page_id_label", "Page ID")}</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      placeholder="e.g., dashboard, projects"
                      value={formData.pageId}
                      onChange={(e) =>
                        handleFormChange("pageId", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="label">
                      <span className="label-text font-medium">{t("page_name_label", "Page Name")}</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      placeholder="e.g., Dashboard, Projects"
                      value={formData.pageName}
                      onChange={(e) =>
                        handleFormChange("pageName", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t("components", "Components")}</span>
                    <span className="label-text-alt">
                      {t("add_components_accessible", "Add components that will be accessible")}
                    </span>
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      className="input input-bordered flex-1"
                      placeholder={t("add_component_placeholder", "Add a component (e.g., projects, tasks)")}
                      value={newComponent}
                      onChange={(e) => setNewComponent(e.target.value)}
                      onKeyPress={(e) => handleComponentKeyPress(e, false)}
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => addComponent(newComponent, false)}
                      disabled={!newComponent.trim()}
                    >
                      {t("add", "Add")}
                    </button>
                  </div>

                  <div className="bg-base-100 p-2 rounded-lg border border-base-300 min-h-16">
                    {formData.components.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {formData.components.map((component, index) => (
                          <div key={index} className="badge badge-lg gap-1 p-3">
                            {component}
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs btn-circle"
                              onClick={() => removeComponent(index)}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-400 text-center py-3">
                        {t("no_components_added_yet", "No components added yet")}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {t("components_helper_text", "Components represent features or sections users can access within this page")}
                  </p>
                </div>

                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleCancel}
                  >
                    {t("cancel", "Cancel")}
                  </button>{" "}
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={
                      createPermission.isPending ||
                      !formData.pageId.trim() ||
                      !formData.pageName.trim()
                    }
                  >
                    {createPermission.isPending ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        {t("creating", "Creating...")}
                      </>
                    ) : (
                      t("create_permission", "Create Permission")
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        <input
          type="radio"
          name="permission_tab_group"
          className="tab"
          aria-label={t("edit_permission", "Edit Permission")}
          checked={activeTab === "edit_permission"}
          onChange={() => setActiveTab("edit_permission")}
        />
        {activeTab === "edit_permission" && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl w-full">
              <h2 className="text-2xl font-bold mb-1">{t("edit_permission", "Edit Permission")}</h2>
              <p className="text-neutral-500 mb-6">
                {t("modify_existing_permission_desc", "Modify existing permission settings.")}
              </p>
              {editingPermission ? (
                <form
                  className="flex flex-col gap-4"
                  onSubmit={handleUpdatePermission}
                >
                  <div className="flex gap-4">
                    <div className="w-1/2">
                      <label className="label">
                        <span className="label-text font-medium">{t("page_id_label", "Page ID")}</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        value={formData.pageId}
                        onChange={(e) =>
                          handleFormChange("pageId", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="w-1/2">
                      <label className="label">
                        <span className="label-text font-medium">
                          {t("page_name_label", "Page Name")}
                        </span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        value={formData.pageName}
                        onChange={(e) =>
                          handleFormChange("pageName", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text font-medium">{t("components", "Components")}</span>
                      <span className="label-text-alt">
                        {t("add_components_accessible", "Add components that will be accessible")}
                      </span>
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        className="input input-bordered flex-1"
                        placeholder={t("add_component_placeholder", "Add a component (e.g., projects, tasks)")}
                        value={editComponent}
                        onChange={(e) => setEditComponent(e.target.value)}
                        onKeyPress={(e) => handleComponentKeyPress(e, true)}
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => addComponent(editComponent, true)}
                        disabled={!editComponent.trim()}
                      >
                        {t("add", "Add")}
                      </button>
                    </div>

                    <div className="bg-base-100 p-2 rounded-lg border border-base-300 min-h-16">
                      {formData.components.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {formData.components.map((component, index) => (
                            <div
                              key={index}
                              className="badge badge-lg gap-1 p-3"
                            >
                              {component}
                              <button
                                type="button"
                                className="btn btn-ghost btn-xs btn-circle"
                                onClick={() => removeComponent(index)}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-gray-400 text-center py-3">
                          {t("no_components_added_yet", "No components added yet")}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {t("components_helper_text", "Components represent features or sections users can access within this page")}
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={handleCancel}
                    >
                      {t("cancel", "Cancel")}
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={
                        updatePermission.isPending ||
                        !formData.pageId.trim() ||
                        !formData.pageName.trim()
                      }
                    >
                      {updatePermission.isPending ? (
                        <>
                          <span className="loading loading-spinner loading-xs"></span>
                          {t("updating", "Updating...")}
                        </>
                      ) : (
                        t("update_permission", "Update Permission")
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <p>{t("no_permission_selected_edit", "No permission selected for editing.")}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PermissionManagement;

import { useState, useMemo } from "react";
import {
  useThreads,
  useCreateThread,
  useUpdateThread,
  useThreadMessages,
  useSendMessage,
  useSendMessageWithAttachments,
  useRFIs,
  useCreateRFI,
  useUpdateRFI,
  useDeleteRFI,
  type Thread,
  type CreateThreadDto,
  type CreateRFIDto,
  type UpdateThreadDto,
  type UpdateRFIDto,
  type RFI,
} from "../hooks/useCommunication";
import { type Project } from "../hooks/useProjects";
import { useUsers, useUserProjects } from "../hooks/useUsers";
import { useAuthStore } from "../stores/useAuthStore";
import { useTranslation } from "../hooks/useTranslation";
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
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { IoClose } from "react-icons/io5";
import { IoAttach } from "react-icons/io5";
import { IoCamera } from "react-icons/io5";
import { IoInformationCircle } from "react-icons/io5";
import { IoDocument, IoImage, IoTrash } from "react-icons/io5";

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

const Communication = () => {
  const { t } = useTranslation();
  // Auth store
  const { user: currentUser } = useAuthStore();

  // API hooks
  const {
    data: threads = [],
    isLoading: threadsLoading,
    error: threadsError,
  } = useThreads();
  const { data: projects = [] } = useUserProjects(currentUser?.id || "");
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: rfis = [], isLoading: rfisLoading } = useRFIs();

  const createThreadMutation = useCreateThread();
  const updateThreadMutation = useUpdateThread();
  const sendMessageMutation = useSendMessage();
  const sendMessageWithAttachmentsMutation = useSendMessageWithAttachments();
  const createRFIMutation = useCreateRFI();
  const updateRFIMutation = useUpdateRFI();
  const deleteRFIMutation = useDeleteRFI();

  // State
  const [activeTab, setActiveTab] = useState("threads");
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [newMessage, setNewMessage] = useState("");

  // Create thread modal state
  const [showCreateThreadModal, setShowCreateThreadModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Create RFI modal state
  const [showCreateRFIModal, setShowCreateRFIModal] = useState(false);
  const [selectedRFIThread, setSelectedRFIThread] = useState<string>("");
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);

  // Edit/Update RFI modal state
  const [showEditRFIModal, setShowEditRFIModal] = useState(false);
  const [editingRFI, setEditingRFI] = useState<RFI | null>(null);
  const [editRFISelectedAssignees, setEditRFISelectedAssignees] = useState<
    string[]
  >([]);

  // Update thread modal state
  const [showEditThreadModal, setShowEditThreadModal] = useState(false);
  const [editingThread, setEditingThread] = useState<Thread | null>(null);
  const [editThreadSelectedUsers, setEditThreadSelectedUsers] = useState<
    string[]
  >([]);

  // Thread info section state
  const [showThreadInfo, setShowThreadInfo] = useState(false);

  // Delete confirmation state
  const [showDeleteRFIModal, setShowDeleteRFIModal] = useState(false);
  const [deletingRFI, setDeletingRFI] = useState<RFI | null>(null);

  // File attachment state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Get messages for selected thread
  const { data: messages = [] } = useThreadMessages(selectedThread?.id || "");

  // Get RFIs for the selected thread
  const selectedThreadRFIs = rfis.filter(
    (rfi) => rfi.threadId === selectedThread?.id
  );

  // Analytics calculations
  const analyticsData = useMemo(() => {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // RFI status breakdown
    const rfisByStatus = rfis.reduce((acc, rfi) => {
      const status = rfi.status || "Unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // RFI priority breakdown
    const rfisByPriority = rfis.reduce((acc, rfi) => {
      const priority = rfi.priority || "Unknown";
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // RFI category breakdown
    const rfisByCategory = rfis.reduce((acc, rfi) => {
      const category = rfi.category || "Other";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Recent activity (last 7 days)
    const recentThreads = threads.filter(
      (thread) => new Date(thread.createdAt) > lastWeek
    ).length;

    const recentRFIs = rfis.filter(
      (rfi) => new Date(rfi.createdAt) > lastWeek
    ).length;

    // Thread activity by project
    const threadsByProject = threads.reduce((acc, thread) => {
      const projectName = thread.project?.name || "Unknown";
      acc[projectName] = (acc[projectName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate average response time (mock data for now)
    const avgResponseTime =
      rfis.length > 0
        ? Math.round(
            rfis.reduce((acc, rfi) => {
              if (rfi.answeredAt && rfi.createdAt) {
                const responseTime =
                  new Date(rfi.answeredAt).getTime() -
                  new Date(rfi.createdAt).getTime();
                return acc + responseTime / (1000 * 60 * 60 * 24); // Convert to days
              }
              return acc;
            }, 0) / rfis.filter((rfi) => rfi.answeredAt).length
          )
        : 0;

    return {
      rfisByStatus,
      rfisByPriority,
      rfisByCategory,
      threadsByProject,
      recentThreads,
      recentRFIs,
      avgResponseTime: avgResponseTime || 2.5,
      totalMessages: messages.length,
      activeUsers: users.filter((user) =>
        threads.some((thread) => thread.users.some((u) => u.id === user.id))
      ).length,
    };
  }, [rfis, threads, messages, users]);

  // Chart data configurations
  const rfiStatusChartData = {
    labels: Object.keys(analyticsData.rfisByStatus),
    datasets: [
      {
        data: Object.values(analyticsData.rfisByStatus),
        backgroundColor: [
          "#ef4444", // red for Open
          "#f59e0b", // amber for In Review
          "#10b981", // emerald for Resolved
          "#6b7280", // gray for others
        ],
        borderWidth: 0,
      },
    ],
  };

  const rfiPriorityChartData = {
    labels: [t("low", "Low"), t("medium", "Medium"), t("high", "High"), t("critical", "Critical")],
    datasets: [
      {
        label: t("rfis_by_priority", "RFIs by Priority"),
        data: [
          analyticsData.rfisByPriority.Low || 0,
          analyticsData.rfisByPriority.Medium || 0,
          analyticsData.rfisByPriority.High || 0,
          analyticsData.rfisByPriority.Critical || 0,
        ],
        backgroundColor: ["#3b82f6", "#f59e0b", "#ef4444", "#dc2626"],
        borderRadius: 4,
      },
    ],
  };

  const threadActivityChartData = {
    labels: Object.keys(analyticsData.threadsByProject).slice(0, 5), // Top 5 projects
    datasets: [
      {
        label: t("threads_tab", "Threads"),
        data: Object.values(analyticsData.threadsByProject).slice(0, 5),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
    },
  };

  const handleSelectThread = (thread: Thread) => {
    setSelectedThread(thread);
    setActiveTab("chat");
  };

  // Create thread handlers
  const handleCreateThread = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const newThread: CreateThreadDto = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      projectId: formData.get("projectId") as string,
      participantIds: selectedUsers,
    };

    createThreadMutation.mutate(newThread, {
      onSuccess: () => {
        setShowCreateThreadModal(false);
        (event.target as HTMLFormElement).reset();
        setSelectedUsers([]);
      },
      onError: (error) => {
        console.error("Failed to create thread:", error);
      },
    });
  };

  const handleAddUser = (userId: string) => {
    if (!selectedUsers.includes(userId)) {
      setSelectedUsers((prev) => [...prev, userId]);
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((id) => id !== userId));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Open":
        return "badge-error";
      case "In Review":
      case "In Progress":
        return "badge-warning";
      case "Resolved":
        return "badge-success";
      case "Answered":
        return "badge-success";
      default:
        return "badge-neutral";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "High":
      case "Critical":
        return "badge-error";
      case "Medium":
        return "badge-warning";
      case "Low":
        return "badge-info";
      default:
        return "badge-neutral";
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if ((newMessage.trim() || selectedFiles.length > 0) && selectedThread) {
      if (selectedFiles.length > 0) {
        // Send message with attachments
        sendMessageWithAttachmentsMutation.mutate(
          {
            message: {
              content: newMessage || " ", // Ensure content is not empty
              threadId: selectedThread.id,
            },
            files: selectedFiles,
          },
          {
            onSuccess: () => {
              setNewMessage("");
              setSelectedFiles([]);
            },
            onError: (error) => {
              console.error("Failed to send message with attachments:", error);
            },
          }
        );
      } else {
        // Send regular message
        sendMessageMutation.mutate(
          {
            content: newMessage,
            threadId: selectedThread.id,
          },
          {
            onSuccess: () => {
              setNewMessage("");
            },
            onError: (error) => {
              console.error("Failed to send message:", error);
            },
          }
        );
      }
    }
  };

  // File and Camera handlers
  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif';
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        const fileArray = Array.from(files);
        setSelectedFiles(prev => [...prev, ...fileArray]);
      }
    };
    input.click();
  };

  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Use rear camera by default
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files[0]) {
        setSelectedFiles(prev => [...prev, files[0]]);
      }
    };
    input.click();
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Helper functions for file handling
  const isImageFile = (filename: string): boolean => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  const getFileIcon = (filename: string) => {
    if (isImageFile(filename)) {
      return <IoImage className="text-blue-500" />;
    }
    return <IoDocument className="text-gray-500" />;
  };

  const getAttachmentUrl = (attachment: string): string => {
    // If attachment starts with http, it's already a full URL
    if (attachment.startsWith('http')) {
      return attachment;
    }
    // Otherwise, construct the URL using the backend base URL
    return `${import.meta.env.VITE_DOCUMENTS_URL || 'http://localhost:3000'}${attachment}`;
  };

  // Create RFI handlers
  const handleCreateRFI = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      let threadId = selectedRFIThread;
      let projectId = formData.get("projectId") as string;

      // If no thread is selected, create a new thread automatically
      if (!selectedRFIThread) {
        const title = formData.get("title") as string;
        const newThreadData: CreateThreadDto = {
          title: `RFI: ${title}`,
          description: formData.get("description") as string,
          projectId: projectId,
          participantIds: selectedAssignees,
        };
        const newThread = await createThreadMutation.mutateAsync(newThreadData);
        threadId = newThread.id;
      } else {
        // If linking to existing thread, use the thread's project ID
        const existingThread = threads.find((t) => t.id === selectedRFIThread);
        if (existingThread) {
          projectId = existingThread.projectId;
        }
      }

      const newRFI: CreateRFIDto = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: (formData.get("category") as string) || undefined,
        priority: (formData.get("priority") as string) || undefined,
        projectId: projectId,
        assignedToIds: selectedAssignees,
        threadId: threadId || undefined,
        dueDate: (formData.get("dueDate") as string) || undefined,
      };

      createRFIMutation.mutate(newRFI, {
        onSuccess: () => {
          setShowCreateRFIModal(false);
          (event.target as HTMLFormElement).reset();
          setSelectedRFIThread("");
          setSelectedAssignees([]);
        },
        onError: (error) => {
          console.error("Failed to create RFI:", error);
        },
      });
    } catch (error) {
      console.error("Failed to create thread for RFI:", error);
    }
  };

  const handleAddAssignee = (userId: string) => {
    if (!selectedAssignees.includes(userId)) {
      setSelectedAssignees((prev) => [...prev, userId]);
    }
  };

  const handleRemoveAssignee = (userId: string) => {
    setSelectedAssignees((prev) => prev.filter((id) => id !== userId));
  };

  // RFI Edit handlers
  const handleEditRFI = (rfi: RFI) => {
    setEditingRFI(rfi);
    // Extract assignee IDs from assignees array
    const assigneeIds = rfi.assignees
      ? rfi.assignees.map((assignee) => assignee.id)
      : [];
    setEditRFISelectedAssignees(assigneeIds);
    setShowEditRFIModal(true);
  };

  const handleAddEditAssignee = (userId: string) => {
    if (!editRFISelectedAssignees.includes(userId)) {
      setEditRFISelectedAssignees((prev) => [...prev, userId]);
    }
  };

  const handleRemoveEditAssignee = (userId: string) => {
    setEditRFISelectedAssignees((prev) => prev.filter((id) => id !== userId));
  };

  // RFI Delete handlers
  const handleDeleteRFI = (rfi: RFI) => {
    setDeletingRFI(rfi);
    setShowDeleteRFIModal(true);
  };

  const confirmDeleteRFI = () => {
    if (!deletingRFI) return;

    deleteRFIMutation.mutate(deletingRFI.id, {
      onSuccess: () => {
        setShowDeleteRFIModal(false);
        setDeletingRFI(null);
      },
      onError: (error) => {
        console.error("Failed to delete RFI:", error);
      },
    });
  };

  // Thread Edit handlers
  const handleEditThread = (thread: Thread) => {
    setEditingThread(thread);
    setEditThreadSelectedUsers(thread.users?.map((u) => u.id) || []);
    setShowEditThreadModal(true);
  };

  const handleAddEditThreadUser = (userId: string) => {
    if (!editThreadSelectedUsers.includes(userId)) {
      setEditThreadSelectedUsers((prev) => [...prev, userId]);
    }
  };

  const handleRemoveEditThreadUser = (userId: string) => {
    setEditThreadSelectedUsers((prev) => prev.filter((id) => id !== userId));
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-1">{t("communication", "Communication")}</h1>
      <p className="text-gray-500 mb-6">
        {t("communication_subtitle", "Team discussions, RFIs, and analytics dashboard")}
      </p>

      {/* Tabs navigation */}
      <div className="tabs tabs-border">
        <input
          type="radio"
          name="comm_tab_group"
          className="tab"
          aria-label={t("threads_tab", "Threads")}
          checked={activeTab === "threads"}
          onChange={() => setActiveTab("threads")}
        />
        {activeTab === "threads" && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{t("discussion_threads", "Discussion Threads")}</h2>
                  <p className="text-neutral-500">
                    {t("discussion_threads_desc", "Group conversations and project discussions")}
                  </p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowCreateThreadModal(true)}
                >
                  + {t("new_thread", "New Thread")}
                </button>
              </div>

              {threadsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : threadsError ? (
                <div className="text-center py-8 text-error">
                  {t("failed_load_threads", "Failed to load threads. Please try again.")}
                </div>
              ) : threads.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {t("no_threads_found", "No threads found. Create your first thread to get started.")}
                </div>
              ) : (
                <div className="space-y-4">
                  {threads.map((thread) => (
                    <div
                      key={thread.id}
                      className="flex flex-col lg:flex-row lg:items-center justify-between border border-base-300 bg-base-100 rounded-2xl p-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-semibold text-lg">
                            {thread.title}
                          </div>
                          {thread.project && (
                            <span className="badge badge-neutral badge-sm">
                              {thread.project.name}
                            </span>
                          )}
                        </div>
                        {thread.description && (
                          <div className="text-gray-500 text-sm mb-2">
                            {thread.description}
                          </div>
                        )}
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="text-xs text-accent">
                            {t("created", "Created")}:{" "}
                            {new Date(thread.createdAt).toLocaleString()}
                          </span>
                          <span className="text-xs badge badge-success text-base-200 font-medium">
                            {t("participants", "Participants")}: {thread.users.length}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4 lg:mt-0">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleSelectThread(thread)}
                        >
                          {t("join_chat", "Join Chat")}
                        </button>
                        <button
                          className="btn btn-soft btn-sm"
                          onClick={() => handleEditThread(thread)}
                        >
                          {t("edit", "Edit")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <input
          type="radio"
          name="comm_tab_group"
          className="tab"
          aria-label={t("chat_tab", "Chat")}
          checked={activeTab === "chat"}
          onChange={() => setActiveTab("chat")}
        />
        {activeTab === "chat" && (
          <div className="tab-content p-5 w-full">
            <div className="flex flex-col lg:flex-row gap-4 w-full h-[calc(100vh-300px)]">
              {/* Left Sidebar: Threads List */}
              <div className="w-full lg:w-80 flex flex-col bg-base-200 border border-base-300 rounded-2xl overflow-hidden shrink-0">
                <div className="p-4 border-b border-base-300 bg-base-300/40 flex justify-between items-center">
                  <h3 className="font-bold text-lg text-base-content">{t("chats_heading", "Chats")}</h3>
                  <button
                    className="btn btn-primary btn-xs"
                    onClick={() => setShowCreateThreadModal(true)}
                  >
                    + {t("new_thread", "New Thread")}
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {threadsLoading ? (
                    <div className="flex justify-center items-center py-4">
                      <span className="loading loading-spinner loading-md"></span>
                    </div>
                  ) : threads.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      {t("no_chats_available", "No chats available")}
                    </div>
                  ) : (
                    threads.map((thread) => {
                      const isSelected = selectedThread?.id === thread.id;
                      return (
                        <button
                          key={thread.id}
                          onClick={() => setSelectedThread(thread)}
                          className={`w-full text-left p-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                            isSelected
                              ? "bg-primary text-primary-content shadow-md"
                              : "hover:bg-base-300 text-base-content"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                            isSelected ? "bg-primary-content/20 text-primary-content" : "bg-primary/10 text-primary"
                          }`}>
                            {thread.title.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm truncate">{thread.title}</div>
                            {thread.project && (
                              <div className={`text-xs truncate ${isSelected ? "text-primary-content/75" : "text-gray-500"}`}>
                                {thread.project.name}
                              </div>
                            )}
                          </div>
                          {thread.users && (
                            <div className={`badge badge-xs shrink-0 ${isSelected ? "badge-outline text-primary-content border-primary-content/30" : "badge-neutral"}`}>
                              {thread.users.length}
                            </div>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Content Area: Chat or Placeholder */}
              {selectedThread ? (
                <div className="flex-1 flex flex-col lg:flex-row gap-3 h-full overflow-hidden min-w-0">
                  {/* Thread Information Panel */}
                  <div
                    id="thread-info"
                    className={`bg-base-200 border border-base-300 rounded-2xl p-4 lg:w-1/3 w-full transition-all duration-300 flex flex-col shrink-0 overflow-y-auto ${
                      showThreadInfo ? "block" : "hidden"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-bold">{t("thread_information", "Thread Information")}</h2>
                      <button
                        className="btn btn-circle btn-sm"
                        onClick={() => setShowThreadInfo(false)}
                      >
                        <IoClose size={15} />
                      </button>
                    </div>

                    <div className="space-y-4 flex-1">
                      {/* Thread Details */}
                      <div className="bg-base-100 p-4 rounded-xl">
                        <h3 className="font-bold text-lg mb-2">{selectedThread.title}</h3>
                        {selectedThread.description && (
                          <p className="text-sm text-gray-600 mb-3">{selectedThread.description}</p>
                        )}
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium">{t("type", "Type")}:</span>
                            <span>{t("general", "General")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">{t("status", "Status")}:</span>
                            <span className="badge badge-sm badge-success">
                              {t("active", "Active")}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">{t("privacy", "Privacy")}:</span>
                            <span>{t("public", "Public")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">{t("messages", "Messages")}:</span>
                            <span>{messages.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">{t("created", "Created")}:</span>
                            <span>{new Date(selectedThread.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Project Info */}
                      {selectedThread.project && (
                        <div className="bg-base-100 p-4 rounded-xl">
                          <h4 className="font-bold mb-2">{t("project", "Project")}</h4>
                          <p className="text-sm">{selectedThread.project.name}</p>
                        </div>
                      )}

                      {/* Participants */}
                      <div className="bg-base-100 p-4 rounded-xl">
                        <h4 className="font-bold mb-2">{t("participants", "Participants")} ({selectedThread.users.length})</h4>
                        <div className="space-y-2">
                          {selectedThread.users.map((user) => (
                            <div key={user.id} className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="text-xs font-medium text-primary">
                                  {user.firstName.charAt(0)}
                                </span>
                              </div>
                              <div className="text-sm">
                                <div className="font-medium">{user.firstName} {user.lastName}</div>
                                <div className="text-gray-500 text-xs">{user.email}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chat Screen */}
                  <div className="bg-base-200 border border-base-300 rounded-2xl overflow-hidden flex flex-col flex-1 h-full min-w-0">
                    <div className="bg-primary p-4 border-b border-base-300 shrink-0">
                      <div className="flex flex-col sm:flex-row justify-between text-primary-content items-start sm:items-center gap-3">
                        <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
                          <div className="flex-1 sm:flex-initial min-w-0">
                            <button
                              className="text-lg sm:text-xl font-bold hover:underline cursor-pointer text-left truncate block w-full"
                              onClick={() => setShowThreadInfo(!showThreadInfo)}
                              title={t("click_thread_info", "Click to view thread information")}
                            >
                              {selectedThread.title}
                            </button>
                            <p className="text-xs sm:text-sm truncate">
                              {t("participants", "Participants")}:{" "}
                              <span className="hidden sm:inline">
                                {selectedThread.users
                                  .map((u) => `${u.firstName} ${u.lastName}`)
                                  .join(", ")}
                              </span>
                              <span className="sm:hidden">
                                {selectedThread.users.length} {t("members", "members")}
                              </span>
                            </p>
                          </div>
                          <button
                            className="btn btn-ghost btn-circle btn-sm shrink-0"
                            onClick={() => setShowThreadInfo(!showThreadInfo)}
                            title={t("thread_information", "Thread Information")}
                          >
                            <IoInformationCircle size={20} />
                          </button>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto shrink-0">
                          <button
                            className="btn btn-active btn-sm sm:btn-md w-full sm:w-auto"
                            onClick={() => setActiveTab("threads")}
                          >
                            <span className="hidden sm:inline">{t("all_threads", "All Threads")}</span>
                            <span className="sm:hidden">{t("threads_tab", "Threads")}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Display RFIs associated with this thread */}
                    {selectedThreadRFIs.length > 0 && (
                      <div className="bg-base-300 p-4 border-b border-base-300 shrink-0">
                        <h3 className="text-sm font-semibold text-gray-600 mb-2">
                          {t("related_rfis", "Related RFIs")} ({selectedThreadRFIs.length})
                        </h3>
                        <div className="space-y-2">
                          {selectedThreadRFIs.map((rfi) => (
                            <div
                              key={rfi.id}
                              className="flex items-center justify-between bg-base-200 p-4 rounded-xl"
                            >
                              <div className="flex-1">
                                <span className="text-lg font-medium">
                                  {rfi.title}
                                </span>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="badge badge-sm badge-neutral">
                                    {rfi.id}
                                  </span>
                                  {rfi.status && (
                                    <span
                                      className={`badge badge-sm ${getStatusBadge(
                                        rfi.status
                                      )}`}
                                    >
                                      {t(rfi.status.toLowerCase().replace(" ", "_"), rfi.status)}
                                    </span>
                                  )}
                                  {rfi.priority && (
                                    <span
                                      className={`badge badge-xs ${getPriorityBadge(
                                        rfi.priority
                                      )}`}
                                    >
                                      {t(rfi.priority.toLowerCase(), rfi.priority)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button
                                className="btn btn-xs btn-outline"
                                onClick={() => setActiveTab("rfis")}
                              >
                                {t("view_rfi", "View RFI")}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                      {messages.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                          {t("no_messages_yet", "No messages yet. Start the conversation!")}
                        </div>
                      ) : (
                        messages.map((message) => {
                          const isCurrentUser =
                            currentUser?.id === message.senderId;
                          return (
                            <div
                              key={message.id}
                              className={`chat ${
                                isCurrentUser ? "chat-end" : "chat-start"
                              }`}
                            >
                              <div className="chat-header text-xs sm:text-sm">
                                <span className="hidden sm:inline">
                                  {message.sender.firstName} {message.sender.lastName}
                                </span>
                                <span className="sm:hidden">
                                  {message.sender.firstName}
                                </span>
                                <time className="text-xs opacity-50 ml-2">
                                  {formatTime(message.createdAt)}
                                </time>
                              </div>
                              <div className="chat-bubble bg-neutral text-neutral-content text-sm sm:text-base max-w-xs sm:max-w-md">
                                {message.content}
                                {message.attachment && (
                                  <div className="mt-2">
                                    {isImageFile(message.attachment) ? (
                                      <img
                                        src={getAttachmentUrl(message.attachment)}
                                        alt="Attachment"
                                        className="max-w-full h-auto rounded-lg cursor-pointer"
                                        onClick={() => window.open(getAttachmentUrl(message.attachment!), '_blank')}
                                      />
                                    ) : (
                                      <a
                                        href={getAttachmentUrl(message.attachment)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                                      >
                                        {getFileIcon(message.attachment)}
                                        <span className="text-xs">
                                          {message.attachment.split('/').pop()}
                                        </span>
                                      </a>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Attachment Preview */}
                    {selectedFiles.length > 0 && (
                      <div className="px-3 sm:px-4 py-2 bg-base-200 border-t border-base-300 shrink-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">
                            {selectedFiles.length} {t("files_selected", "files selected")}
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedFiles([])}
                            className="btn btn-ghost btn-xs"
                          >
                            {t("clear_all", "Clear all")}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm"
                            >
                              <div className="flex items-center gap-1">
                                {getFileIcon(file.name)}
                                <span className="text-xs max-w-20 truncate">
                                  {file.name}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(index)}
                                className="btn btn-ghost btn-circle btn-xs text-red-500 hover:bg-red-100"
                              >
                                <IoTrash size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <form
                      onSubmit={handleSendMessage}
                      className="p-3 sm:p-4 border-t border-base-300 bg-base-300 shrink-0"
                    >
                      <div className="flex gap-2 items-end">
                        {/* File and Camera Actions */}
                        <div className="flex flex-col gap-2 sm:flex-row sm:gap-1">
                          <button
                            type="button"
                            className="btn btn-ghost btn-circle btn-sm sm:btn-md bg-base-200 rounded-full p-1"
                            onClick={handleFileUpload}
                            title={t("upload_documents", "Upload Documents")}
                          >
                            <div className="flex items-center justify-center">
                              <IoAttach size={18} />
                            </div>
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-circle btn-sm sm:btn-md bg-base-200 rounded-full p-1"
                            onClick={handleCameraCapture}
                            title={t("take_photo", "Take Photo")}
                          >
                            <div className="flex items-center justify-center">
                              <IoCamera size={18} />
                            </div>
                          </button>
                        </div>
                        <input
                          type="text"
                          className="input input-bordered input-sm sm:input-md flex-1"
                          placeholder={t("type_message_placeholder", "Type your message...")}
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          disabled={sendMessageMutation.isPending || sendMessageWithAttachmentsMutation.isPending}
                        />
                        <button
                          type="submit"
                          className="btn btn-primary btn-sm sm:btn-md"
                          disabled={
                            sendMessageMutation.isPending || 
                            sendMessageWithAttachmentsMutation.isPending || 
                            (!newMessage.trim() && selectedFiles.length === 0)
                          }
                        >
                          {(sendMessageMutation.isPending || sendMessageWithAttachmentsMutation.isPending) ? (
                            <span className="loading loading-spinner loading-sm"></span>
                          ) : (
                            <span className="hidden sm:inline">{t("send", "Send")}</span>
                          )}
                          <span className="sm:hidden">📤</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              ) : (
                // Placeholder when no thread is selected
                <div className="flex-1 flex flex-col items-center justify-center bg-base-200 border border-base-300 rounded-2xl p-8 text-center h-full">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{t("welcome_chat_title", "Welcome to ONE-365 Chat")}</h3>
                  <p className="text-gray-500 max-w-md mb-6 text-sm">
                    {t("welcome_chat_desc", "Select a conversation thread from the sidebar on the left to start chatting with your team, or click the button below to create a new thread.")}
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowCreateThreadModal(true)}
                  >
                    + {t("start_new_thread", "Start a New Thread")}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <input
          type="radio"
          name="comm_tab_group"
          className="tab"
          aria-label={t("rfis_tab", "RFIs")}
          checked={activeTab === "rfis"}
          onChange={() => setActiveTab("rfis")}
        />
        {activeTab === "rfis" && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold">
                    {t("rfi_title_tab", "Request for Information (RFI)")}
                  </h2>
                  <p className="text-neutral-500">
                    {t("rfi_subtitle_tab", "Track information requests and responses")}
                  </p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowCreateRFIModal(true)}
                >
                  + {t("new_rfi", "New RFI")}
                </button>
              </div>

              {rfisLoading ? (
                <div className="flex justify-center items-center py-8">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : rfis.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {t("no_rfis_found", "No RFIs found. Create your first RFI to get started.")}
                </div>
              ) : (
                <div className="space-y-4">
                  {rfis.map((rfi) => (
                    <div
                      key={rfi.id}
                      className="border border-base-300 bg-base-100 rounded-2xl p-4"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="badge badge-neutral">
                              {rfi.id}
                            </span>
                            {rfi.priority && (
                              <span
                                className={`badge ${getPriorityBadge(
                                  rfi.priority
                                )}`}
                              >
                                {t(rfi.priority.toLowerCase(), rfi.priority)}
                              </span>
                            )}
                            {rfi.status && (
                              <span
                                className={`badge ${getStatusBadge(
                                  rfi.status
                                )}`}
                              >
                                {t(rfi.status.toLowerCase().replace(" ", "_"), rfi.status)}
                              </span>
                            )}
                          </div>
                          <div className="font-semibold text-lg mb-1">
                            {rfi.title}
                          </div>
                          <div className="text-gray-500 text-sm mb-2">
                            {rfi.description}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">{t("thread_meta", "Thread")}:</span>{" "}
                            {rfi.thread?.title || t("no_thread_linked", "No thread linked")} |
                            <span className="font-medium"> {t("created_by", "Created by")}:</span>{" "}
                            {rfi.requester
                              ? `${rfi.requester.firstName} ${rfi.requester.lastName}`
                              : t("unknown", "Unknown")}
                            {rfi.assignees && rfi.assignees.length > 0 && (
                              <>
                                |{" "}
                                <span className="font-medium">
                                  {" "}
                                  {t("assigned_to_lbl", "Assigned to")}:
                                </span>{" "}
                                {rfi.assignees
                                  .map((a) => `${a.firstName} ${a.lastName}`)
                                  .join(", ")}
                              </>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">{t("created", "Created")}:</span>{" "}
                            {new Date(rfi.createdAt).toLocaleDateString()} |
                            <span className="font-medium"> {t("updated_lbl", "Updated")}:</span>{" "}
                            {new Date(rfi.updatedAt).toLocaleDateString()}
                            {rfi.dueDate && (
                              <>
                                | <span className="font-medium"> {t("due_lbl", "Due")}:</span>{" "}
                                {new Date(rfi.dueDate).toLocaleDateString()}
                              </>
                            )}
                          </div>
                          {rfi.answer && (
                            <div className="mt-2 p-2 bg-base-200 rounded text-sm">
                              <span className="font-medium">{t("answer_lbl", "Answer")}:</span>{" "}
                              {rfi.answer}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {rfi.threadId && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                const thread = threads.find(
                                  (t) => t.id === rfi.threadId
                                );
                                if (thread) {
                                  handleSelectThread(thread);
                                }
                              }}
                            >
                              {t("open_chat", "Open Chat")}
                            </button>
                          )}
                          <button
                            className="btn btn-soft btn-sm"
                            onClick={() => handleEditRFI(rfi)}
                          >
                            {t("edit", "Edit")}
                          </button>
                          <button
                            className="btn btn-error btn-sm"
                            onClick={() => handleDeleteRFI(rfi)}
                          >
                            {t("delete", "Delete")}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <input
          type="radio"
          name="comm_tab_group"
          className="tab"
          aria-label="Analytics"
          checked={activeTab === "analytics"}
          onChange={() => setActiveTab("analytics")}
        />
        {activeTab === "analytics" && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    {t("communication_analytics", "Communication Analytics")}
                  </h2>
                  <p className="text-neutral-500">
                    {t("communication_analytics_subtitle", "Comprehensive insights into communication performance and trends")}
                  </p>
                </div>
                <div className="badge badge-neutral badge-lg">{t("last_30_days", "Last 30 Days")}</div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="stat bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg">
                  <div className="stat-figure">
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    </svg>
                  </div>
                  <div className="stat-title text-blue-100">{t("active_threads", "Active Threads")}</div>
                  <div className="stat-value">{threads.length}</div>
                  <div className="stat-desc text-blue-200">
                    +{analyticsData.recentThreads} {t("this_week", "this week")}
                  </div>
                </div>

                <div className="stat bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl shadow-lg">
                  <div className="stat-figure">
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path
                        fillRule="evenodd"
                        d="M4 5a2 2 0 012-2v1a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2V3a2 2 0 012-2 2 2 0 012 2v8a4 4 0 01-4 4H6a4 4 0 01-4-4V5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="stat-title text-amber-100">{t("open_rfis", "Open RFIs")}</div>
                  <div className="stat-value">
                    {analyticsData.rfisByStatus.Open || 0}
                  </div>
                  <div className="stat-desc text-amber-200">
                    {rfis.filter((r) => r.status === "Open").length} {t("pending_responses", "pending responses")}
                  </div>
                </div>

                <div className="stat bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl shadow-lg">
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
                  <div className="stat-title text-emerald-100">
                    {t("resolution_rate", "Resolution Rate")}
                  </div>
                  <div className="stat-value">
                    {rfis.length > 0
                      ? Math.round(
                          ((analyticsData.rfisByStatus.Resolved || 0) /
                            rfis.length) *
                            100
                        )
                      : 0}
                    %
                  </div>
                  <div className="stat-desc text-emerald-200">
                    {analyticsData.rfisByStatus.Resolved || 0} {t("resolved_rfis", "resolved RFIs")}
                  </div>
                </div>

                <div className="stat bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg">
                  <div className="stat-figure">
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                  </div>
                  <div className="stat-title text-purple-100">{t("active_users", "Active Users")}</div>
                  <div className="stat-value">{analyticsData.activeUsers}</div>
                  <div className="stat-desc text-purple-200">
                    {t("participating_discussions", "Participating in discussions")}
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* RFI Status Distribution */}
                <div className="bg-base-100 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      {t("rfi_status_distribution", "RFI Status Distribution")}
                    </h3>
                    <div className="badge badge-neutral badge-sm">
                      {rfis.length} {t("total", "Total")}
                    </div>
                  </div>
                  <div className="h-64">
                    {Object.keys(analyticsData.rfisByStatus).length > 0 ? (
                      <Doughnut
                        data={rfiStatusChartData}
                        options={chartOptions}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        {t("no_rfi_data_available", "No RFI data available")}
                      </div>
                    )}
                  </div>
                </div>

                {/* RFI Priority Breakdown */}
                <div className="bg-base-100 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      {t("rfi_priority_breakdown", "RFI Priority Breakdown")}
                    </h3>
                    <div className="badge badge-neutral badge-sm">
                      {t("by_priority", "By Priority")}
                    </div>
                  </div>
                  <div className="h-64">
                    {Object.keys(analyticsData.rfisByPriority).length > 0 ? (
                      <Bar data={rfiPriorityChartData} options={chartOptions} />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        {t("no_priority_data_available", "No priority data available")}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Thread Activity by Project */}
                <div className="bg-base-100 rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4">
                    {t("thread_activity_project", "Thread Activity by Project")}
                  </h3>
                  <div className="h-48">
                    {Object.keys(analyticsData.threadsByProject).length > 0 ? (
                      <Line
                        data={threadActivityChartData}
                        options={chartOptions}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        {t("no_project_data_available", "No project data available")}
                      </div>
                    )}
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="bg-base-100 rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4">
                    {t("performance_metrics", "Performance Metrics")}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {t("avg_rfi_response_time", "Avg RFI Response Time")}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">
                          {analyticsData.avgResponseTime}
                        </span>
                        <span className="text-sm text-gray-500">{t("days", "days")}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            (analyticsData.avgResponseTime / 5) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {t("thread_engagement", "Thread Engagement")}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">
                          {(
                            analyticsData.totalMessages / threads.length || 0
                          ).toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {t("msgs_per_thread", "msgs/thread")}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            ((analyticsData.totalMessages / threads.length ||
                              0) /
                              10) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {t("recent_activity", "Recent Activity")}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">
                          {analyticsData.recentRFIs +
                            analyticsData.recentThreads}
                        </span>
                        <span className="text-sm text-gray-500">{t("this_week", "this week")}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            ((analyticsData.recentRFIs +
                              analyticsData.recentThreads) /
                              20) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* RFI Categories */}
                <div className="bg-base-100 rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4">{t("rfi_categories", "RFI Categories")}</h3>
                  <div className="space-y-3">
                    {Object.entries(analyticsData.rfisByCategory)
                       .sort(([, a], [, b]) => b - a)
                      .slice(0, 6)
                      .map(([category, count]) => (
                        <div
                          key={category}
                          className="flex justify-between items-center"
                        >
                          <span className="text-sm font-medium">
                            {t(`category_${category.toLowerCase()}`, category)}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-indigo-600 h-2 rounded-full"
                                style={{
                                  width: `${
                                    (count /
                                      Math.max(
                                        ...Object.values(
                                          analyticsData.rfisByCategory
                                        )
                                      )) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-bold w-8 text-right">
                              {count}
                            </span>
                          </div>
                        </div>
                      ))}
                    {Object.keys(analyticsData.rfisByCategory).length === 0 && (
                      <div className="text-center text-gray-500 py-4">
                        {t("no_category_data_available", "No category data available")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Thread Modal */}
      {showCreateThreadModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            backdropFilter: "blur(4px)",
            background: "rgba(0,0,0,0.2)",
          }}
        >
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">{t("create_new_thread", "Create New Thread")}</h3>

            <form onSubmit={handleCreateThread} className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text font-medium">{t("thread_title_required", "Thread Title *")}</span>
                </label>
                <input
                  type="text"
                  name="title"
                  className="input input-bordered w-full"
                  placeholder={t("enter_thread_title_placeholder", "Enter thread title...")}
                  required
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">{t("description", "Description")}</span>
                </label>
                <textarea
                  name="description"
                  className="textarea textarea-bordered w-full h-24"
                  placeholder={t("optional_description_placeholder", "Optional description...")}
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">{t("project_required", "Project *")}</span>
                </label>
                <select
                  name="projectId"
                  className="select select-bordered w-full"
                  required
                >
                  <option value="">{t("select_project", "Select a project")}</option>
                  {projects.map((project: Project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    {t("add_participants", "Add Participants")}
                  </span>
                </label>
                <div className="border border-base-300 rounded-lg p-3 min-h-[100px] max-h-32 overflow-y-auto">
                  {usersLoading ? (
                    <div className="text-center text-gray-500">
                      {t("loading_users", "Loading users...")}
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center text-gray-500">
                      {t("no_users_available", "No users available")}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm">
                            {user.firstName} {user.lastName} ({user.email})
                          </span>
                          {selectedUsers.includes(user.id) ? (
                            <button
                              type="button"
                              className="btn btn-error btn-xs"
                              onClick={() => handleRemoveUser(user.id)}
                            >
                              {t("remove", "Remove")}
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-primary btn-xs"
                              onClick={() => handleAddUser(user.id)}
                            >
                              {t("add", "Add")}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedUsers.length > 0 && (
                  <div className="mt-2">
                    <span className="text-sm text-gray-600">
                      {t("selected", "Selected")}: {selectedUsers.length} {t("participant_s", "participant(s)")}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowCreateThreadModal(false);
                    setSelectedUsers([]);
                  }}
                  disabled={createThreadMutation.isPending}
                >
                  {t("cancel", "Cancel")}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createThreadMutation.isPending}
                >
                  {createThreadMutation.isPending ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      {t("creating", "Creating...")}
                    </>
                  ) : (
                    t("create_thread", "Create Thread")
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create RFI Modal */}
      {showCreateRFIModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            backdropFilter: "blur(4px)",
            background: "rgba(0,0,0,0.2)",
          }}
        >
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">{t("create_new_rfi", "Create New RFI")}</h3>

            <form onSubmit={handleCreateRFI} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t("rfi_title_required", "RFI Title *")}</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    className="input input-bordered w-full"
                    placeholder={t("enter_rfi_title_placeholder", "Enter RFI title...")}
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t("project_required", "Project *")}</span>
                  </label>
                  <select
                    name="projectId"
                    className="select select-bordered w-full"
                    required={!selectedRFIThread}
                    disabled={!!selectedRFIThread}
                    value={
                      selectedRFIThread
                        ? threads.find((t) => t.id === selectedRFIThread)
                            ?.projectId || ""
                        : undefined
                    }
                  >
                    <option value="">
                      {selectedRFIThread
                        ? `${t("project", "Project")}: ${
                            threads.find((t) => t.id === selectedRFIThread)
                              ?.project?.name || t("unknown", "Unknown")
                          }`
                        : t("select_project", "Select a project")}
                    </option>
                    {!selectedRFIThread &&
                      projects.map((project: Project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                  </select>
                  {selectedRFIThread && (
                    <div className="label">
                      <span className="label-text-alt text-info">
                        {t("project_set_by_thread", "Project is set by the selected thread")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">{t("description_required", "Description *")}</span>
                </label>
                <textarea
                  name="description"
                  className="textarea textarea-bordered w-full h-24"
                  placeholder={t("describe_rfi_placeholder", "Describe the information you need...")}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t("category", "Category")}</span>
                  </label>
                  <select
                    name="category"
                    className="select select-bordered w-full"
                  >
                    <option value="">{t("select_category", "Select category")}</option>
                    <option value="Design">{t("category_design", "Design")}</option>
                    <option value="Construction">{t("category_construction", "Construction")}</option>
                    <option value="Materials">{t("category_materials", "Materials")}</option>
                    <option value="Specifications">{t("category_specifications", "Specifications")}</option>
                    <option value="Safety">{t("category_safety", "Safety")}</option>
                    <option value="Quality">{t("category_quality", "Quality")}</option>
                    <option value="Other">{t("category_other", "Other")}</option>
                  </select>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t("priority", "Priority")}</span>
                  </label>
                  <select
                    name="priority"
                    className="select select-bordered w-full"
                  >
                    <option value="">{t("select_priority", "Select priority")}</option>
                    <option value="Low">{t("low", "Low")}</option>
                    <option value="Medium">{t("medium", "Medium")}</option>
                    <option value="High">{t("high", "High")}</option>
                    <option value="Critical">{t("critical", "Critical")}</option>
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
                  />
                </div>
              </div>

              {/* Thread Selection */}
              <div className="divider">{t("thread_association", "Thread Association")}</div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    {t("link_to_existing_thread", "Link to Existing Thread")}
                  </span>
                </label>
                <select
                  value={selectedRFIThread}
                  onChange={(e) => setSelectedRFIThread(e.target.value)}
                  className="select select-bordered w-full"
                >
                  <option value="">{t("create_new_thread_for_rfi", "Create new thread for this RFI")}</option>
                  {threads.map((thread) => (
                    <option key={thread.id} value={thread.id}>
                      {thread.title} ({thread.project?.name || t("no_project", "No project")})
                    </option>
                  ))}
                </select>
                <div className="label">
                  <span className="label-text-alt text-gray-500">
                    {selectedRFIThread
                      ? t("rfi_linked_to_thread", "RFI will be linked to the selected thread")
                      : t("new_thread_automatic_rfi", "A new thread will be created automatically for this RFI")}
                  </span>
                </div>
              </div>

              {/* Assignees Selection */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">{t("assign_to", "Assign To")}</span>
                </label>
                <div className="border border-base-300 rounded-lg p-3 min-h-[100px] max-h-32 overflow-y-auto">
                  {usersLoading ? (
                    <div className="text-center text-gray-500">
                      {t("loading_users", "Loading users...")}
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center text-gray-500">
                      {t("no_users_available", "No users available")}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm">
                            {user.firstName} {user.lastName} ({user.email})
                          </span>
                          {selectedAssignees.includes(user.id) ? (
                            <button
                              type="button"
                              className="btn btn-error btn-xs"
                              onClick={() => handleRemoveAssignee(user.id)}
                            >
                              {t("remove", "Remove")}
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-primary btn-xs"
                              onClick={() => handleAddAssignee(user.id)}
                            >
                              {t("add", "Add")}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedAssignees.length > 0 && (
                  <div className="mt-2">
                    <span className="text-sm text-gray-600">
                      {t("assigned_to", "Assigned to")}: {selectedAssignees.length} {t("user_s", "user(s)")}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowCreateRFIModal(false);
                    setSelectedRFIThread("");
                    setSelectedAssignees([]);
                  }}
                  disabled={
                    createRFIMutation.isPending ||
                    createThreadMutation.isPending
                  }
                >
                  {t("cancel", "Cancel")}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    createRFIMutation.isPending ||
                    createThreadMutation.isPending
                  }
                >
                  {createRFIMutation.isPending ||
                  createThreadMutation.isPending ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      {t("creating", "Creating...")}
                    </>
                  ) : (
                    t("create_rfi", "Create RFI")
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit RFI Modal */}
      {showEditRFIModal && editingRFI && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">{t("edit_rfi", "Edit RFI")}</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingRFI) {
                  const formData = new FormData(e.currentTarget);
                  const updatedRFI: UpdateRFIDto = {
                    title: formData.get("title") as string,
                    description: formData.get("description") as string,
                    category: (formData.get("category") as string) || undefined,
                    priority: (formData.get("priority") as string) || undefined,
                    status: (formData.get("status") as string) || undefined,
                    assignedToIds: editRFISelectedAssignees,
                    dueDate: (formData.get("dueDate") as string) || undefined,
                    answer: (formData.get("answer") as string) || undefined,
                  };
                  updateRFIMutation.mutate(
                    { id: editingRFI.id, rfi: updatedRFI },
                    {
                      onSuccess: () => {
                        setShowEditRFIModal(false);
                        setEditingRFI(null);
                        setEditRFISelectedAssignees([]);
                      },
                      onError: (error) => {
                        console.error("Failed to update RFI:", error);
                      },
                    }
                  );
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="label">
                  <span className="label-text font-medium">{t("rfi_title_required", "RFI Title *")}</span>
                </label>
                <input
                  type="text"
                  name="title"
                  className="input input-bordered w-full"
                  placeholder={t("enter_rfi_title_placeholder", "Enter RFI title...")}
                  defaultValue={editingRFI.title}
                  required
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">{t("project_required", "Project *")}</span>
                </label>
                <select
                  name="projectId"
                  className="select select-bordered w-full"
                  defaultValue={editingRFI.projectId}
                  required
                >
                  <option value="">{t("select_project", "Select a project")}</option>
                  {projects.map((project: Project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">{t("description", "Description")}</span>
                </label>
                <textarea
                  name="description"
                  className="textarea textarea-bordered w-full h-24"
                  placeholder={t("optional_description_placeholder", "Optional description...")}
                  defaultValue={editingRFI.description}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t("category", "Category")}</span>
                  </label>
                  <select
                    name="category"
                    className="select select-bordered w-full"
                    defaultValue={editingRFI.category}
                  >
                    <option value="">{t("select_category", "Select category")}</option>
                    <option value="Design">{t("category_design", "Design")}</option>
                    <option value="Construction">{t("category_construction", "Construction")}</option>
                    <option value="Materials">{t("category_materials", "Materials")}</option>
                    <option value="Specifications">{t("category_specifications", "Specifications")}</option>
                    <option value="Safety">{t("category_safety", "Safety")}</option>
                    <option value="Quality">{t("category_quality", "Quality")}</option>
                    <option value="Other">{t("category_other", "Other")}</option>
                  </select>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t("priority", "Priority")}</span>
                  </label>
                  <select
                    name="priority"
                    className="select select-bordered w-full"
                    defaultValue={editingRFI.priority}
                  >
                    <option value="">{t("select_priority", "Select priority")}</option>
                    <option value="Low">{t("low", "Low")}</option>
                    <option value="Medium">{t("medium", "Medium")}</option>
                    <option value="High">{t("high", "High")}</option>
                    <option value="Critical">{t("critical", "Critical")}</option>
                  </select>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t("status", "Status")}</span>
                  </label>
                  <select
                    name="status"
                    className="select select-bordered w-full"
                    defaultValue={editingRFI.status}
                  >
                    <option value="">{t("select_status", "Select status")}</option>
                    <option value="Open">{t("open", "Open")}</option>
                    <option value="In Review">{t("in_review", "In Review")}</option>
                    <option value="Answered">{t("answered", "Answered")}</option>
                    <option value="Closed">{t("closed", "Closed")}</option>
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
                      editingRFI.dueDate
                        ? new Date(editingRFI.dueDate)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                  />
                </div>
              </div>

              {/* Answer field for RFI */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">{t("answer", "Answer")}</span>
                </label>
                <textarea
                  name="answer"
                  className="textarea textarea-bordered w-full h-24"
                  placeholder={t("provide_answer_placeholder", "Provide answer to this RFI...")}
                  defaultValue={editingRFI.answer || ""}
                />
              </div>

              {/* Assignees Selection */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">{t("assign_to", "Assign To")}</span>
                </label>
                <div className="border border-base-300 rounded-lg p-3 min-h-[100px] max-h-32 overflow-y-auto">
                  {usersLoading ? (
                    <div className="text-center text-gray-500">
                      {t("loading_users", "Loading users...")}
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center text-gray-500">
                      {t("no_users_available", "No users available")}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm">
                            {user.firstName} {user.lastName} ({user.email})
                          </span>
                          {editRFISelectedAssignees.includes(user.id) ? (
                            <button
                              type="button"
                              className="btn btn-error btn-xs"
                              onClick={() => handleRemoveEditAssignee(user.id)}
                            >
                              {t("remove", "Remove")}
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-primary btn-xs"
                              onClick={() => handleAddEditAssignee(user.id)}
                            >
                              {t("add", "Add")}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {editRFISelectedAssignees.length > 0 && (
                  <div className="mt-2">
                    <span className="text-sm text-gray-600">
                      {t("assigned_to", "Assigned to")}: {editRFISelectedAssignees.length} {t("user_s", "user(s)")}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowEditRFIModal(false);
                    setEditingRFI(null);
                    setEditRFISelectedAssignees([]);
                  }}
                  disabled={updateRFIMutation.isPending}
                >
                  {t("cancel", "Cancel")}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updateRFIMutation.isPending}
                >
                  {updateRFIMutation.isPending ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      {t("updating", "Updating...")}
                    </>
                  ) : (
                    t("update_rfi", "Update RFI")
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Thread Modal */}
      {showEditThreadModal && editingThread && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">{t("update_thread", "Update Thread")}</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingThread) {
                  const formData = new FormData(e.currentTarget);
                  const updatedThread: UpdateThreadDto = {
                    title: formData.get("title") as string,
                    description: formData.get("description") as string,
                    projectId: formData.get("projectId") as string,
                    participantIds: editThreadSelectedUsers,
                  };
                  updateThreadMutation.mutate(
                    { id: editingThread.id, thread: updatedThread },
                    {
                      onSuccess: () => {
                        setShowEditThreadModal(false);
                        setEditingThread(null);
                        setEditThreadSelectedUsers([]);
                      },
                      onError: (error) => {
                        console.error("Failed to update thread:", error);
                      },
                    }
                  );
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="label">
                  <span className="label-text font-medium">{t("thread_title_required", "Thread Title *")}</span>
                </label>
                <input
                  type="text"
                  name="title"
                  className="input input-bordered w-full"
                  placeholder={t("enter_thread_title_placeholder", "Enter thread title...")}
                  defaultValue={editingThread.title}
                  required
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">{t("description", "Description")}</span>
                </label>
                <textarea
                  name="description"
                  className="textarea textarea-bordered w-full h-24"
                  placeholder={t("optional_description_placeholder", "Optional description...")}
                  defaultValue={editingThread.description}
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">{t("project_required", "Project *")}</span>
                </label>
                <select
                  name="projectId"
                  className="select select-bordered w-full"
                  defaultValue={editingThread.projectId}
                  required
                >
                  <option value="">{t("select_project", "Select a project")}</option>
                  {projects.map((project: Project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    {t("add_participants", "Add Participants")}
                  </span>
                </label>
                <div className="border border-base-300 rounded-lg p-3 min-h-[100px] max-h-32 overflow-y-auto">
                  {usersLoading ? (
                    <div className="text-center text-gray-500">
                      {t("loading_users", "Loading users...")}
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center text-gray-500">
                      {t("no_users_available", "No users available")}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm">
                            {user.firstName} {user.lastName} ({user.email})
                          </span>
                          {editThreadSelectedUsers.includes(user.id) ? (
                            <button
                              type="button"
                              className="btn btn-error btn-xs"
                              onClick={() =>
                                handleRemoveEditThreadUser(user.id)
                              }
                            >
                              {t("remove", "Remove")}
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-primary btn-xs"
                              onClick={() => handleAddEditThreadUser(user.id)}
                            >
                              {t("add", "Add")}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {editThreadSelectedUsers.length > 0 && (
                  <div className="mt-2">
                    <span className="text-sm text-gray-600">
                      {t("selected", "Selected")}: {editThreadSelectedUsers.length} {t("participant_s", "participant(s)")}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowEditThreadModal(false);
                    setEditingThread(null);
                    setEditThreadSelectedUsers([]);
                  }}
                  disabled={updateThreadMutation.isPending}
                >
                  {t("cancel", "Cancel")}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updateThreadMutation.isPending}
                >
                  {updateThreadMutation.isPending ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      {t("updating", "Updating...")}
                    </>
                  ) : (
                    t("update_thread", "Update Thread")
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete RFI Confirmation Modal */}
      {showDeleteRFIModal && deletingRFI && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{t("confirm_deletion", "Confirm Deletion")}</h3>
            <p className="text-gray-700 mb-4">
              {t("confirm_delete_rfi_desc", "Are you sure you want to delete this RFI? This action cannot be undone.")}
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="btn btn-outline"
                onClick={() => setShowDeleteRFIModal(false)}
              >
                {t("cancel", "Cancel")}
              </button>
              <button className="btn btn-error" onClick={confirmDeleteRFI}>
                {t("delete", "Delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Communication;

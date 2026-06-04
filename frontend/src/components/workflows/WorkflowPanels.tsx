import { useMemo, useState } from "react";
import type { Document } from "../../hooks/useDocuments";
import type { CrewMember } from "../../hooks/useProjects";
import { useTranslation } from "../../hooks/useTranslation";
import {
  downloadTimecardsCsv,
  useAcknowledgeTransmittal,
  useCorrespondence,
  useCreateCorrespondence,
  useCreateEmailAccount,
  useCreateMeeting,
  useCreatePunchListItem,
  useCreateTimecard,
  useCreateTransmittal,
  useEmailAccounts,
  useEmailMessages,
  useForwardEmail,
  useMeetings,
  usePunchListItems,
  useReplyEmail,
  useSendTransmittal,
  useSubmittalWorkflows,
  useSyncEmail,
  useTimecards,
  useTransmittals,
  useUpdatePunchListItem,
  useUpdateTimecardStatus,
  useUpsertSubmittalWorkflow,
  type EmailMessage,
} from "../../hooks/useWorkflowTools";

const today = () => new Date().toISOString().slice(0, 10);

const formatDate = (value?: string) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
};

const statusBadge = (status?: string) => {
  switch (status) {
    case "Closed":
    case "Acknowledged":
    case "Approved":
    case "Sent":
    case "Received":
      return "badge-success";
    case "Ready for Review":
    case "Submitted":
    case "In Progress":
    case "In Review":
      return "badge-warning";
    case "Rejected":
    case "Failed":
      return "badge-error";
    default:
      return "badge-neutral";
  }
};

const EmptyState = ({ title, description }: { title: string; description: string }) => (
  <div className="rounded-xl border border-dashed border-base-300 bg-base-100 p-8 text-center">
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="mt-1 text-sm text-base-content/60">{description}</p>
  </div>
);

const ProjectRequired = () => {
  const { t } = useTranslation();
  return (
    <EmptyState
      title={t("select_project_first", "Please select a project first")}
      description={t("workflow_project_required", "These records are organized per project.")}
    />
  );
};

export const TransmittalsPanel = ({
  projectId,
  documents,
}: {
  projectId: string;
  documents: Document[];
}) => {
  const { t } = useTranslation();
  const { data: transmittals = [], isLoading } = useTransmittals(projectId);
  const createTransmittal = useCreateTransmittal();
  const sendTransmittal = useSendTransmittal();
  const acknowledgeTransmittal = useAcknowledgeTransmittal();
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

  if (!projectId) return <ProjectRequired />;

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await createTransmittal.mutateAsync({
      projectId,
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      dueDate: (formData.get("dueDate") as string) || undefined,
      notes: (formData.get("notes") as string) || undefined,
      documentIds: selectedDocuments,
      recipients: [
        {
          name: formData.get("recipientName") as string,
          email: (formData.get("recipientEmail") as string) || undefined,
          company: (formData.get("recipientCompany") as string) || undefined,
        },
      ],
    });
    setSelectedDocuments([]);
    event.currentTarget.reset();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="grid gap-4 rounded-xl border border-base-300 bg-base-100 p-4 lg:grid-cols-6">
        <input name="title" className="input input-bordered lg:col-span-2" placeholder={t("title", "Title")} required />
        <input name="recipientName" className="input input-bordered" placeholder={t("recipient", "Recipient")} required />
        <input name="recipientEmail" type="email" className="input input-bordered" placeholder={t("email", "Email")} />
        <input name="recipientCompany" className="input input-bordered" placeholder={t("company", "Company")} />
        <input name="dueDate" type="date" className="input input-bordered" />
        <textarea name="description" className="textarea textarea-bordered lg:col-span-3" placeholder={t("description", "Description")} />
        <textarea name="notes" className="textarea textarea-bordered lg:col-span-3" placeholder={t("notes", "Notes")} />
        <select
          multiple
          className="select select-bordered h-28 lg:col-span-5"
          value={selectedDocuments}
          onChange={(event) =>
            setSelectedDocuments(Array.from(event.target.selectedOptions).map((option) => option.value))
          }
        >
          {documents.map((document) => (
            <option key={document.id} value={document.id}>
              {document.name}
            </option>
          ))}
        </select>
        <button className="btn btn-primary" disabled={createTransmittal.isPending}>
          {t("create_transmittal", "Create Transmittal")}
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100">
        <table className="table">
          <thead>
            <tr>
              <th>{t("number", "Number")}</th>
              <th>{t("title", "Title")}</th>
              <th>{t("status", "Status")}</th>
              <th>{t("due_date", "Due Date")}</th>
              <th>{t("documents", "Documents")}</th>
              <th>{t("actions", "Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6}><span className="loading loading-spinner loading-sm" /></td></tr>
            ) : transmittals.length === 0 ? (
              <tr><td colSpan={6}><EmptyState title={t("no_transmittals", "No transmittals yet")} description={t("create_first_transmittal", "Create the first project transmittal from the form above.")} /></td></tr>
            ) : (
              transmittals.map((transmittal) => (
                <tr key={transmittal.id}>
                  <td className="font-mono">{transmittal.number}</td>
                  <td className="font-medium">{transmittal.title}</td>
                  <td><span className={`badge ${statusBadge(transmittal.status)}`}>{transmittal.status}</span></td>
                  <td>{formatDate(transmittal.dueDate)}</td>
                  <td>{transmittal.documents?.length || 0}</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <button className="btn btn-xs btn-outline" onClick={() => sendTransmittal.mutate(transmittal.id)} disabled={transmittal.status !== "Draft"}>
                        {t("send", "Send")}
                      </button>
                      <button className="btn btn-xs btn-outline" onClick={() => acknowledgeTransmittal.mutate(transmittal.id)} disabled={transmittal.status === "Acknowledged"}>
                        {t("acknowledge", "Acknowledge")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const SubmittalWorkflowsPanel = ({
  projectId,
  documents,
}: {
  projectId: string;
  documents: Document[];
}) => {
  const { t } = useTranslation();
  const submittalDocs = documents.filter((document) => document.type === "submittals");
  const { data: workflows = [], isLoading } = useSubmittalWorkflows(projectId);
  const upsertWorkflow = useUpsertSubmittalWorkflow();

  if (!projectId) return <ProjectRequired />;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await upsertWorkflow.mutateAsync({
      projectId,
      documentId: formData.get("documentId") as string,
      status: formData.get("status") as string,
      dueDate: (formData.get("dueDate") as string) || undefined,
      response: (formData.get("response") as string) || undefined,
      notes: (formData.get("notes") as string) || undefined,
    });
    event.currentTarget.reset();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="grid gap-4 rounded-xl border border-base-300 bg-base-100 p-4 lg:grid-cols-5">
        <select name="documentId" className="select select-bordered lg:col-span-2" required disabled={submittalDocs.length === 0}>
          <option value="">{t("select_submittal_document", "Select submittal document")}</option>
          {submittalDocs.map((document) => (
            <option key={document.id} value={document.id}>{document.name}</option>
          ))}
        </select>
        <select name="status" className="select select-bordered" defaultValue="In Review">
          <option>Draft</option>
          <option>Submitted</option>
          <option>In Review</option>
          <option>Approved</option>
          <option>Rejected</option>
          <option>Closed</option>
        </select>
        <input name="dueDate" type="date" className="input input-bordered" />
        <button className="btn btn-primary" disabled={upsertWorkflow.isPending || submittalDocs.length === 0}>
          {t("save_workflow", "Save Workflow")}
        </button>
        <textarea name="response" className="textarea textarea-bordered lg:col-span-2" placeholder={t("review_response", "Review response")} />
        <textarea name="notes" className="textarea textarea-bordered lg:col-span-3" placeholder={t("notes", "Notes")} />
      </form>

      <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100">
        <table className="table">
          <thead>
            <tr>
              <th>{t("document", "Document")}</th>
              <th>{t("status", "Status")}</th>
              <th>{t("due_date", "Due Date")}</th>
              <th>{t("response", "Response")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4}><span className="loading loading-spinner loading-sm" /></td></tr>
            ) : workflows.length === 0 ? (
              <tr><td colSpan={4}><EmptyState title={t("no_submittal_workflows", "No formal submittals yet")} description={t("submittal_workflow_empty", "Upload a submittal document and assign its review workflow here.")} /></td></tr>
            ) : (
              workflows.map((workflow) => (
                <tr key={workflow.id}>
                  <td className="font-medium">{workflow.document?.name || workflow.documentId}</td>
                  <td><span className={`badge ${statusBadge(workflow.status)}`}>{workflow.status}</span></td>
                  <td>{formatDate(workflow.dueDate)}</td>
                  <td>{workflow.response || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const CorrespondencePanel = ({ projectId }: { projectId: string }) => {
  const { t } = useTranslation();
  const { data: correspondence = [], isLoading } = useCorrespondence(projectId);
  const createCorrespondence = useCreateCorrespondence();

  if (!projectId) return <ProjectRequired />;

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await createCorrespondence.mutateAsync({
      projectId,
      type: formData.get("type") as string,
      direction: formData.get("direction") as string,
      subject: formData.get("subject") as string,
      body: (formData.get("body") as string) || undefined,
      senderName: (formData.get("senderName") as string) || undefined,
      senderEmail: (formData.get("senderEmail") as string) || undefined,
      dueDate: (formData.get("dueDate") as string) || undefined,
      recipients: [
        {
          name: formData.get("recipientName") as string,
          email: (formData.get("recipientEmail") as string) || undefined,
        },
      ],
    });
    event.currentTarget.reset();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="grid gap-4 rounded-xl border border-base-300 bg-base-100 p-4 lg:grid-cols-6">
        <select name="type" className="select select-bordered" defaultValue="Letter">
          <option>Letter</option>
          <option>Notice</option>
          <option>Memo</option>
          <option>Email</option>
        </select>
        <select name="direction" className="select select-bordered" defaultValue="Outgoing">
          <option>Incoming</option>
          <option>Outgoing</option>
        </select>
        <input name="subject" className="input input-bordered lg:col-span-2" placeholder={t("subject", "Subject")} required />
        <input name="dueDate" type="date" className="input input-bordered" />
        <button className="btn btn-primary" disabled={createCorrespondence.isPending}>
          {t("create", "Create")}
        </button>
        <input name="senderName" className="input input-bordered" placeholder={t("sender", "Sender")} />
        <input name="senderEmail" type="email" className="input input-bordered" placeholder={t("sender_email", "Sender email")} />
        <input name="recipientName" className="input input-bordered" placeholder={t("recipient", "Recipient")} required />
        <input name="recipientEmail" type="email" className="input input-bordered" placeholder={t("recipient_email", "Recipient email")} />
        <textarea name="body" className="textarea textarea-bordered lg:col-span-2" placeholder={t("body", "Body")} />
      </form>

      <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100">
        <table className="table">
          <thead>
            <tr>
              <th>{t("number", "Number")}</th>
              <th>{t("subject", "Subject")}</th>
              <th>{t("type", "Type")}</th>
              <th>{t("direction", "Direction")}</th>
              <th>{t("status", "Status")}</th>
              <th>{t("due_date", "Due Date")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6}><span className="loading loading-spinner loading-sm" /></td></tr>
            ) : correspondence.length === 0 ? (
              <tr><td colSpan={6}><EmptyState title={t("no_correspondence", "No correspondence yet")} description={t("create_first_correspondence", "Create formal incoming or outgoing correspondence for this project.")} /></td></tr>
            ) : (
              correspondence.map((item) => (
                <tr key={item.id}>
                  <td className="font-mono">{item.number}</td>
                  <td className="font-medium">{item.subject}</td>
                  <td>{item.type}</td>
                  <td>{item.direction}</td>
                  <td><span className={`badge ${statusBadge(item.status)}`}>{item.status}</span></td>
                  <td>{formatDate(item.dueDate)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const EmailInboxPanel = ({ projectId }: { projectId: string }) => {
  const { t } = useTranslation();
  const { data: accounts = [] } = useEmailAccounts();
  const { data: messages = [], isLoading } = useEmailMessages(projectId);
  const createAccount = useCreateEmailAccount();
  const syncEmail = useSyncEmail();
  const replyEmail = useReplyEmail();
  const forwardEmail = useForwardEmail();
  const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [forwardTo, setForwardTo] = useState("");

  const handleCreateAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await createAccount.mutateAsync({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      syncEnabled: true,
    });
    event.currentTarget.reset();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <form onSubmit={handleCreateAccount} className="rounded-xl border border-base-300 bg-base-100 p-4">
          <h3 className="font-bold">{t("email_account", "Email Account")}</h3>
          <p className="mb-4 text-sm text-base-content/60">
            {t("email_config_hint", "If IMAP/SMTP env vars are missing, records stay local and send attempts are marked failed.")}
          </p>
          <div className="space-y-3">
            <input name="name" className="input input-bordered w-full" placeholder={t("account_name", "Account name")} required />
            <input name="email" type="email" className="input input-bordered w-full" placeholder={t("email", "Email")} required />
            <button className="btn btn-primary w-full" disabled={createAccount.isPending}>{t("save_account", "Save Account")}</button>
          </div>
        </form>

        <div className="rounded-xl border border-base-300 bg-base-100 p-4 lg:col-span-2">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-bold">{t("mail_sync", "Mail Sync")}</h3>
              <p className="text-sm text-base-content/60">{t("mail_sync_desc", "Sync, read, reply, forward and keep local message records.")}</p>
            </div>
            <button className="btn btn-outline" onClick={() => syncEmail.mutate(accounts[0]?.id)} disabled={syncEmail.isPending}>
              {t("sync_inbox", "Sync Inbox")}
            </button>
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {accounts.length === 0 ? (
              <div className="badge badge-warning">{t("email_account_required", "Email account required")}</div>
            ) : (
              accounts.map((account) => (
                <div key={account.id} className="rounded-lg bg-base-200 p-3">
                  <div className="font-medium">{account.email}</div>
                  <div className={`badge badge-sm ${statusBadge(account.status)}`}>{account.status}</div>
                  <div className="text-xs text-base-content/60">{t("last_sync", "Last sync")}: {formatDate(account.lastSyncedAt)}</div>
                </div>
              ))
            )}
          </div>
          {syncEmail.data && (
            <div className={`alert mt-4 ${syncEmail.data.configured ? "alert-success" : "alert-warning"}`}>
              <span>{syncEmail.data.message}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100">
          <table className="table">
            <thead>
              <tr>
                <th>{t("from", "From")}</th>
                <th>{t("subject", "Subject")}</th>
                <th>{t("status", "Status")}</th>
                <th>{t("date", "Date")}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4}><span className="loading loading-spinner loading-sm" /></td></tr>
              ) : messages.length === 0 ? (
                <tr><td colSpan={4}><EmptyState title={t("no_email_messages", "No email messages")} description={t("sync_or_send_emails", "Sync configured mailboxes or keep local reply/forward records here.")} /></td></tr>
              ) : (
                messages.map((message) => (
                  <tr key={message.id} className="cursor-pointer hover:bg-base-200" onClick={() => setSelectedMessage(message)}>
                    <td>{message.from}</td>
                    <td className="font-medium">{message.subject}</td>
                    <td><span className={`badge ${statusBadge(message.status)}`}>{message.status}</span></td>
                    <td>{formatDate(message.receivedAt || message.sentAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-base-300 bg-base-100 p-4">
          {selectedMessage ? (
            <div className="space-y-4">
              <div>
                <div className="text-xs uppercase text-base-content/50">{selectedMessage.direction}</div>
                <h3 className="text-lg font-bold">{selectedMessage.subject}</h3>
                <p className="text-sm text-base-content/60">{selectedMessage.from}</p>
              </div>
              <p className="max-h-48 overflow-y-auto whitespace-pre-wrap text-sm">{selectedMessage.body || "-"}</p>
              <textarea className="textarea textarea-bordered w-full" placeholder={t("reply", "Reply")} value={replyBody} onChange={(event) => setReplyBody(event.target.value)} />
              <button
                className="btn btn-primary btn-sm w-full"
                disabled={!replyBody.trim() || replyEmail.isPending}
                onClick={() => {
                  replyEmail.mutate({ id: selectedMessage.id, body: replyBody });
                  setReplyBody("");
                }}
              >
                {t("send_reply", "Send Reply")}
              </button>
              <input className="input input-bordered w-full" placeholder={t("forward_to", "Forward to")} value={forwardTo} onChange={(event) => setForwardTo(event.target.value)} />
              <button
                className="btn btn-outline btn-sm w-full"
                disabled={!forwardTo.trim() || forwardEmail.isPending}
                onClick={() => {
                  forwardEmail.mutate({ id: selectedMessage.id, to: [forwardTo], body: replyBody || undefined });
                  setForwardTo("");
                  setReplyBody("");
                }}
              >
                {t("forward", "Forward")}
              </button>
            </div>
          ) : (
            <EmptyState title={t("select_email", "Select an email")} description={t("select_email_desc", "Choose a message to read, reply or forward.")} />
          )}
        </div>
      </div>
    </div>
  );
};

export const MeetingsPanel = ({ projectId }: { projectId: string }) => {
  const { t } = useTranslation();
  const { data: meetings = [], isLoading } = useMeetings(projectId);
  const createMeeting = useCreateMeeting();

  if (!projectId) return <ProjectRequired />;

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const startDate = formData.get("startDate") as string;
    const startTime = (formData.get("startTime") as string) || "09:00";
    const endDate = (formData.get("endDate") as string) || startDate;
    const endTime = (formData.get("endTime") as string) || "10:00";
    await createMeeting.mutateAsync({
      projectId,
      title: formData.get("title") as string,
      startDate: new Date(`${startDate}T${startTime}`).toISOString(),
      endDate: new Date(`${endDate}T${endTime}`).toISOString(),
      location: (formData.get("location") as string) || undefined,
      agenda: (formData.get("agenda") as string) || undefined,
    });
    event.currentTarget.reset();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="grid gap-4 rounded-xl border border-base-300 bg-base-100 p-4 lg:grid-cols-6">
        <input name="title" className="input input-bordered lg:col-span-2" placeholder={t("meeting_title", "Meeting title")} required />
        <input name="location" className="input input-bordered" placeholder={t("location", "Location")} />
        <input name="startDate" type="date" className="input input-bordered" defaultValue={today()} required />
        <input name="startTime" type="time" className="input input-bordered" defaultValue="09:00" />
        <button className="btn btn-primary" disabled={createMeeting.isPending}>{t("create_meeting", "Create Meeting")}</button>
        <input name="endDate" type="date" className="input input-bordered" defaultValue={today()} />
        <input name="endTime" type="time" className="input input-bordered" defaultValue="10:00" />
        <textarea name="agenda" className="textarea textarea-bordered lg:col-span-4" placeholder={t("agenda", "Agenda")} />
      </form>

      <div className="grid gap-4 lg:grid-cols-2">
        {isLoading ? (
          <span className="loading loading-spinner loading-sm" />
        ) : meetings.length === 0 ? (
          <div className="lg:col-span-2">
            <EmptyState title={t("no_meetings", "No meetings yet")} description={t("create_first_meeting", "Create meetings with agenda, attendees, minutes and action items.")} />
          </div>
        ) : (
          meetings.map((meeting) => (
            <div key={meeting.id} className="rounded-xl border border-base-300 bg-base-100 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold">{meeting.title}</h3>
                  <p className="text-sm text-base-content/60">{formatDate(meeting.startDate)} - {meeting.location || t("no_location", "No location")}</p>
                </div>
                <span className="badge badge-info">MEETING</span>
              </div>
              {meeting.meetingMinute?.agenda && (
                <p className="mt-3 text-sm">{meeting.meetingMinute.agenda}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="badge badge-outline">{meeting.meetingMinute?.attendees?.length || 0} {t("attendees", "Attendees")}</span>
                <span className="badge badge-outline">{meeting.meetingMinute?.actionItems?.length || 0} {t("action_items", "Action Items")}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const PunchListPanel = ({ projectId }: { projectId: string }) => {
  const { t } = useTranslation();
  const { data: items = [], isLoading } = usePunchListItems(projectId);
  const createItem = useCreatePunchListItem();
  const updateItem = useUpdatePunchListItem();

  if (!projectId) return <ProjectRequired />;

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await createItem.mutateAsync({
      projectId,
      payload: {
        title: formData.get("title") as string,
        description: (formData.get("description") as string) || undefined,
        location: (formData.get("location") as string) || undefined,
        discipline: (formData.get("discipline") as string) || undefined,
        priority: formData.get("priority") as string,
        dueDate: (formData.get("dueDate") as string) || undefined,
      },
    });
    event.currentTarget.reset();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="grid gap-4 rounded-xl border border-base-300 bg-base-100 p-4 lg:grid-cols-6">
        <input name="title" className="input input-bordered lg:col-span-2" placeholder={t("punch_item", "Punch item")} required />
        <input name="location" className="input input-bordered" placeholder={t("location", "Location")} />
        <input name="discipline" className="input input-bordered" placeholder={t("discipline", "Discipline")} />
        <select name="priority" className="select select-bordered" defaultValue="Medium">
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
          <option>Critical</option>
        </select>
        <input name="dueDate" type="date" className="input input-bordered" />
        <textarea name="description" className="textarea textarea-bordered lg:col-span-5" placeholder={t("description", "Description")} />
        <button className="btn btn-primary" disabled={createItem.isPending}>{t("add_item", "Add Item")}</button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100">
        <table className="table">
          <thead>
            <tr>
              <th>{t("item", "Item")}</th>
              <th>{t("location", "Location")}</th>
              <th>{t("discipline", "Discipline")}</th>
              <th>{t("status", "Status")}</th>
              <th>{t("due_date", "Due Date")}</th>
              <th>{t("actions", "Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6}><span className="loading loading-spinner loading-sm" /></td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6}><EmptyState title={t("no_punch_items", "No punch items yet")} description={t("create_first_punch_item", "Track closeout items by location, discipline, owner and status.")} /></td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td className="font-medium">{item.title}</td>
                  <td>{item.location || "-"}</td>
                  <td>{item.discipline || "-"}</td>
                  <td><span className={`badge ${statusBadge(item.status)}`}>{item.status}</span></td>
                  <td>{formatDate(item.dueDate)}</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <button className="btn btn-xs btn-outline" onClick={() => updateItem.mutate({ projectId, id: item.id, payload: { status: "Ready for Review" } })}>
                        {t("ready", "Ready")}
                      </button>
                      <button className="btn btn-xs btn-outline" onClick={() => updateItem.mutate({ projectId, id: item.id, payload: { status: "Closed" } })}>
                        {t("close", "Close")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const TimecardsPanel = ({
  projectId,
  crewMembers,
}: {
  projectId: string;
  crewMembers: CrewMember[];
}) => {
  const { t } = useTranslation();
  const { data: timecards = [], isLoading } = useTimecards(projectId);
  const createTimecard = useCreateTimecard();
  const updateStatus = useUpdateTimecardStatus();
  const [exporting, setExporting] = useState(false);

  const defaultCrewMember = useMemo(() => crewMembers.find((member) => member.isActive) || crewMembers[0], [crewMembers]);

  if (!projectId) return <ProjectRequired />;

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const weekStart = formData.get("weekStart") as string;
    await createTimecard.mutateAsync({
      projectId,
      payload: {
        crewMemberId: formData.get("crewMemberId") as string,
        weekStart,
        notes: (formData.get("notes") as string) || undefined,
        entries: [
          {
            date: weekStart,
            regularHours: Number(formData.get("regularHours") || 0),
            overtimeHours: Number(formData.get("overtimeHours") || 0),
            breakHours: Number(formData.get("breakHours") || 0),
            notes: (formData.get("entryNotes") as string) || undefined,
          },
        ],
      },
    });
    event.currentTarget.reset();
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await downloadTimecardsCsv(projectId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `timecards-${projectId}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="grid gap-4 rounded-xl border border-base-300 bg-base-100 p-4 lg:grid-cols-7">
        <select name="crewMemberId" className="select select-bordered lg:col-span-2" defaultValue={defaultCrewMember?.id || ""} required disabled={crewMembers.length === 0}>
          <option value="">{t("select_worker", "Select worker")}</option>
          {crewMembers.map((member) => (
            <option key={member.id} value={member.id}>{member.name} - {member.role}</option>
          ))}
        </select>
        <input name="weekStart" type="date" className="input input-bordered" defaultValue={today()} required />
        <input name="regularHours" type="number" min="0" step="0.25" className="input input-bordered" placeholder={t("regular_hours", "Regular hours")} required />
        <input name="overtimeHours" type="number" min="0" step="0.25" className="input input-bordered" placeholder={t("overtime", "Overtime")} />
        <input name="breakHours" type="number" min="0" step="0.25" className="input input-bordered" placeholder={t("breaks", "Breaks")} />
        <button className="btn btn-primary" disabled={createTimecard.isPending || crewMembers.length === 0}>{t("save_timecard", "Save Timecard")}</button>
        <textarea name="notes" className="textarea textarea-bordered lg:col-span-3" placeholder={t("notes", "Notes")} />
        <textarea name="entryNotes" className="textarea textarea-bordered lg:col-span-4" placeholder={t("entry_notes", "Entry notes")} />
      </form>

      <div className="flex justify-end">
        <button className="btn btn-outline" onClick={handleExport} disabled={exporting || timecards.length === 0}>
          {t("export_csv", "Export CSV")}
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100">
        <table className="table">
          <thead>
            <tr>
              <th>{t("worker", "Worker")}</th>
              <th>{t("week_start", "Week Start")}</th>
              <th>{t("regular", "Regular")}</th>
              <th>{t("overtime", "Overtime")}</th>
              <th>{t("breaks", "Breaks")}</th>
              <th>{t("status", "Status")}</th>
              <th>{t("actions", "Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7}><span className="loading loading-spinner loading-sm" /></td></tr>
            ) : timecards.length === 0 ? (
              <tr><td colSpan={7}><EmptyState title={t("no_timecards", "No timecards yet")} description={t("create_first_timecard", "Create weekly timecards and submit them for approval.")} /></td></tr>
            ) : (
              timecards.map((timecard) => (
                <tr key={timecard.id}>
                  <td className="font-medium">{timecard.crewMember?.name || timecard.crewMemberId}</td>
                  <td>{formatDate(timecard.weekStart)}</td>
                  <td>{timecard.totalRegularHours}</td>
                  <td>{timecard.totalOvertimeHours}</td>
                  <td>{timecard.totalBreakHours}</td>
                  <td><span className={`badge ${statusBadge(timecard.status)}`}>{timecard.status}</span></td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <button className="btn btn-xs btn-outline" onClick={() => updateStatus.mutate({ projectId, id: timecard.id, status: "Submitted" })}>
                        {t("submit", "Submit")}
                      </button>
                      <button className="btn btn-xs btn-outline" onClick={() => updateStatus.mutate({ projectId, id: timecard.id, status: "Approved" })}>
                        {t("approve", "Approve")}
                      </button>
                      <button className="btn btn-xs btn-outline" onClick={() => updateStatus.mutate({ projectId, id: timecard.id, status: "Rejected", rejectionReason: "Rejected from timecard review" })}>
                        {t("reject", "Reject")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

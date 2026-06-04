import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import instance from "../api/axiosInstance";

export interface WorkflowRecipient {
  userId?: string;
  name: string;
  email?: string;
  company?: string;
  role?: string;
}

export interface Transmittal {
  id: string;
  projectId: string;
  number: string;
  title: string;
  description?: string;
  status: string;
  dueDate?: string;
  sentAt?: string;
  acknowledgedAt?: string;
  notes?: string;
  documents?: { id: string; name: string; url: string; type: string }[];
  recipients?: WorkflowRecipient[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransmittalDto {
  projectId: string;
  title: string;
  description?: string;
  dueDate?: string;
  notes?: string;
  documentIds?: string[];
  recipients?: WorkflowRecipient[];
}

export interface SubmittalWorkflow {
  id: string;
  projectId: string;
  documentId: string;
  status: string;
  reviewerId?: string;
  dueDate?: string;
  response?: string;
  notes?: string;
  document?: { id: string; name: string; type: string; url: string };
}

export interface Correspondence {
  id: string;
  projectId: string;
  number: string;
  type: string;
  direction: string;
  status: string;
  senderName?: string;
  senderEmail?: string;
  subject: string;
  body?: string;
  dueDate?: string;
  sentAt?: string;
  receivedAt?: string;
  recipients?: WorkflowRecipient[];
  documents?: { id: string; name: string; url: string; type: string }[];
}

export interface EmailAccount {
  id: string;
  name: string;
  email: string;
  status: string;
  syncEnabled: boolean;
  lastSyncedAt?: string;
}

export interface EmailMessage {
  id: string;
  projectId?: string;
  correspondenceId?: string;
  direction: string;
  status: string;
  from: string;
  to: string[];
  cc: string[];
  subject: string;
  body?: string;
  receivedAt?: string;
  sentAt?: string;
}

export interface Meeting {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  type: "MEETING";
  meetingMinute?: {
    agenda?: string;
    minutes?: string;
    attendees?: { id: string; name: string; email?: string; status: string }[];
    actionItems?: {
      id: string;
      title: string;
      assigneeId?: string;
      dueDate?: string;
      status: string;
    }[];
  };
}

export interface PunchListItem {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  location?: string;
  discipline?: string;
  status: string;
  priority: string;
  assigneeId?: string;
  dueDate?: string;
}

export interface Timecard {
  id: string;
  projectId: string;
  crewMemberId: string;
  weekStart: string;
  status: string;
  totalRegularHours: number;
  totalOvertimeHours: number;
  totalBreakHours: number;
  notes?: string;
  crewMember?: { id: string; name: string; role: string };
  entries?: {
    id: string;
    date: string;
    regularHours: number;
    overtimeHours: number;
    breakHours: number;
    notes?: string;
  }[];
}

export const useTransmittals = (projectId?: string) =>
  useQuery({
    queryKey: ["transmittals", projectId],
    queryFn: async () => {
      const query = projectId ? `?projectId=${projectId}` : "";
      const { data } = await instance.get(`/documents/transmittals${query}`);
      return data as Transmittal[];
    },
  });

export const useCreateTransmittal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateTransmittalDto) => {
      const { data } = await instance.post("/documents/transmittals", payload);
      return data as Transmittal;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["transmittals", variables.projectId] });
    },
  });
};

export const useSendTransmittal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await instance.post(`/documents/transmittals/${id}/send`);
      return data as Transmittal;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transmittals"] }),
  });
};

export const useAcknowledgeTransmittal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await instance.post(`/documents/transmittals/${id}/acknowledge`, {});
      return data as Transmittal;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transmittals"] }),
  });
};

export const useSubmittalWorkflows = (projectId?: string) =>
  useQuery({
    queryKey: ["submittal-workflows", projectId],
    queryFn: async () => {
      const query = projectId ? `?projectId=${projectId}` : "";
      const { data } = await instance.get(`/documents/submittal-workflows${query}`);
      return data as SubmittalWorkflow[];
    },
  });

export const useUpsertSubmittalWorkflow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<SubmittalWorkflow> & { projectId: string; documentId: string }) => {
      const { data } = await instance.post("/documents/submittal-workflows", payload);
      return data as SubmittalWorkflow;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["submittal-workflows", variables.projectId] });
    },
  });
};

export const useCorrespondence = (projectId?: string) =>
  useQuery({
    queryKey: ["correspondence", projectId],
    queryFn: async () => {
      const query = projectId ? `?projectId=${projectId}` : "";
      const { data } = await instance.get(`/communication/correspondence${query}`);
      return data as Correspondence[];
    },
  });

export const useCreateCorrespondence = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Correspondence> & { projectId: string; subject: string }) => {
      const { data } = await instance.post("/communication/correspondence", payload);
      return data as Correspondence;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["correspondence", variables.projectId] });
    },
  });
};

export const useEmailAccounts = () =>
  useQuery({
    queryKey: ["email-accounts"],
    queryFn: async () => {
      const { data } = await instance.get("/communication/email/accounts");
      return data as EmailAccount[];
    },
  });

export const useCreateEmailAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; email: string; syncEnabled?: boolean }) => {
      const { data } = await instance.post("/communication/email/accounts", payload);
      return data as EmailAccount;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["email-accounts"] }),
  });
};

export const useEmailMessages = (projectId?: string) =>
  useQuery({
    queryKey: ["email-messages", projectId],
    queryFn: async () => {
      const query = projectId ? `?projectId=${projectId}` : "";
      const { data } = await instance.get(`/communication/email/messages${query}`);
      return data as EmailMessage[];
    },
  });

export const useSyncEmail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (accountId?: string) => {
      const { data } = await instance.post("/communication/email/sync", { accountId });
      return data as { configured: boolean; imported: number; skipped: number; message: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-messages"] });
      queryClient.invalidateQueries({ queryKey: ["email-accounts"] });
    },
  });
};

export const useReplyEmail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: string }) => {
      const { data } = await instance.post(`/communication/email/messages/${id}/reply`, { body });
      return data as EmailMessage;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["email-messages"] }),
  });
};

export const useForwardEmail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, to, body }: { id: string; to: string[]; body?: string }) => {
      const { data } = await instance.post(`/communication/email/messages/${id}/forward`, { to, body });
      return data as EmailMessage;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["email-messages"] }),
  });
};

export const useMeetings = (projectId?: string) =>
  useQuery({
    queryKey: ["meetings", projectId],
    queryFn: async () => {
      const query = projectId ? `?projectId=${projectId}` : "";
      const { data } = await instance.get(`/schedule/meetings${query}`);
      return data as Meeting[];
    },
  });

export const useCreateMeeting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      projectId: string;
      title: string;
      startDate: string;
      endDate?: string;
      agenda?: string;
      location?: string;
    }) => {
      const { data } = await instance.post("/schedule/meetings", payload);
      return data as Meeting;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["meetings", variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ["schedule-events", variables.projectId] });
    },
  });
};

export const usePunchListItems = (projectId?: string) =>
  useQuery({
    queryKey: ["punch-list", projectId],
    queryFn: async () => {
      const { data } = await instance.get(`/projects/${projectId}/punch-list`);
      return data as PunchListItem[];
    },
    enabled: !!projectId,
  });

export const useCreatePunchListItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, payload }: { projectId: string; payload: Partial<PunchListItem> & { title: string } }) => {
      const { data } = await instance.post(`/projects/${projectId}/punch-list`, payload);
      return data as PunchListItem;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["punch-list", variables.projectId] });
    },
  });
};

export const useUpdatePunchListItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, id, payload }: { projectId: string; id: string; payload: Partial<PunchListItem> }) => {
      const { data } = await instance.patch(`/projects/${projectId}/punch-list/${id}`, payload);
      return data as PunchListItem;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["punch-list", variables.projectId] });
    },
  });
};

export const useTimecards = (projectId?: string) =>
  useQuery({
    queryKey: ["timecards", projectId],
    queryFn: async () => {
      const { data } = await instance.get(`/projects/${projectId}/timecards`);
      return data as Timecard[];
    },
    enabled: !!projectId,
  });

export const useCreateTimecard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, payload }: { projectId: string; payload: { crewMemberId: string; weekStart: string; notes?: string; entries: { date: string; regularHours: number; overtimeHours?: number; breakHours?: number; notes?: string }[] } }) => {
      const { data } = await instance.post(`/projects/${projectId}/timecards`, payload);
      return data as Timecard;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["timecards", variables.projectId] });
    },
  });
};

export const useUpdateTimecardStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, id, status, rejectionReason }: { projectId: string; id: string; status: string; rejectionReason?: string }) => {
      const { data } = await instance.post(`/projects/${projectId}/timecards/${id}/status`, { status, rejectionReason });
      return data as Timecard;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["timecards", variables.projectId] });
    },
  });
};

export const downloadTimecardsCsv = async (projectId: string) => {
  const { data } = await instance.get(`/projects/${projectId}/timecards/export`, {
    responseType: "blob",
  });
  return data as Blob;
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

export interface Document {
  id: string;
  title: string;
  task_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  version_id?: string;
  version_number?: number;
  file_name?: string;
  file_path?: string;
  file_type?: string;
  file_size?: number;
  uploaded_by?: string;
  creator_name?: string;
  uploaded_at?: string;
  task_title?: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
  uploader_name?: string;
}

export const DOCUMENTS_KEY = ['documents'];

export const useDocuments = (taskId?: string | null) => {
  return useQuery({
    queryKey: taskId ? [...DOCUMENTS_KEY, { taskId }] : DOCUMENTS_KEY,
    queryFn: async () => {
      const url = taskId
        ? `${ENDPOINTS.documents.list}?taskId=${taskId}`
        : ENDPOINTS.documents.list;
      const { data } = await apiClient.get<{ data: { documents: Document[] } }>(url);
      return data.data.documents;
    },
  });
};

export const useDocumentVersions = (documentId?: string) => {
  return useQuery({
    queryKey: [...DOCUMENTS_KEY, documentId, 'versions'],
    queryFn: async () => {
      if (!documentId) return [];
      const { data } = await apiClient.get<{ data: { versions: DocumentVersion[] } }>(
        ENDPOINTS.documents.versions(documentId)
      );
      return data.data.versions;
    },
    enabled: !!documentId,
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { title: string; taskId?: string | null; file: File }) => {
      const formData = new FormData();
      formData.append('title', payload.title);
      if (payload.taskId) {
        formData.append('taskId', payload.taskId);
      }
      formData.append('file', payload.file);

      const { data } = await apiClient.post<{ data: { document: Document } }>(
        ENDPOINTS.documents.create,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return data.data.document;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY });
      if (variables.taskId) {
        queryClient.invalidateQueries({ queryKey: [...DOCUMENTS_KEY, { taskId: variables.taskId }] });
      }
    },
  });
};

export const useUploadVersion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { documentId: string; file: File }) => {
      const formData = new FormData();
      formData.append('file', payload.file);

      const { data } = await apiClient.post<{ data: { version: DocumentVersion } }>(
        ENDPOINTS.documents.uploadVersion(payload.documentId),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return data.data.version;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY });
      queryClient.invalidateQueries({ queryKey: [...DOCUMENTS_KEY, variables.documentId, 'versions'] });
    },
  });
};

export const useLinkDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, taskId }: { documentId: string; taskId: string | null }) => {
      const { data } = await apiClient.patch<{ data: { document: Document } }>(
        ENDPOINTS.documents.link(documentId),
        { taskId }
      );
      return data.data.document;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY });
    },
  });
};

export const useDownloadVersion = () => {
  return useMutation({
    mutationFn: async (versionId: string) => {
      const response = await apiClient.get(ENDPOINTS.documents.download(versionId), {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: response.headers['content-type'] as string });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Extract filename from Content-Disposition header
      const disposition = response.headers['content-disposition'];
      let filename = 'download';
      if (disposition && disposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
  });
};

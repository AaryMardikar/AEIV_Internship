import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useUploadDocument, useUploadVersion } from '../../hooks/useDocuments';

interface UploadDocumentDialogProps {
  open: boolean;
  onClose: () => void;
  documentId?: string;       // If present, uploading new version
  documentTitle?: string;    // If present, show the title of the document we are updating
  taskId?: string | null;     // Optional default task association
}

const UploadDocumentDialog: React.FC<UploadDocumentDialogProps> = ({
  open,
  onClose,
  documentId,
  documentTitle,
  taskId,
}) => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const uploadDocument = useUploadDocument();
  const uploadVersion = useUploadVersion();

  const isNewVersion = !!documentId;
  const isPending = uploadDocument.isPending || uploadVersion.isPending;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!isNewVersion && !title) {
        // Pre-fill title with filename (without extension)
        const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
        setTitle(nameWithoutExt);
      }
    }
  };

  const handleClose = () => {
    setTitle('');
    setFile(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!file) return;

    if (isNewVersion) {
      await uploadVersion.mutateAsync({
        documentId: documentId!,
        file,
      });
    } else {
      if (!title) return;
      await uploadDocument.mutateAsync({
        title,
        taskId,
        file,
      });
    }

    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isNewVersion ? `Upload New Version for "${documentTitle}"` : 'Upload Document'}
      </DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={3} pt={1}>
          {!isNewVersion && (
            <TextField
              label="Document Title"
              fullWidth
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isPending}
            />
          )}

          <Box
            border="2px dashed"
            borderColor="divider"
            borderRadius={2}
            p={4}
            textAlign="center"
            sx={{
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover',
              },
            }}
            component="label"
          >
            <input
              type="file"
              hidden
              onChange={handleFileChange}
              disabled={isPending}
            />
            <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body1" color="text.primary">
              {file ? file.name : 'Click to select or drag and drop a file'}
            </Typography>
            {file && (
              <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit" disabled={isPending}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!file || (!isNewVersion && !title) || isPending}
          startIcon={isPending ? <CircularProgress size={20} /> : undefined}
        >
          {isNewVersion ? 'Upload Version' : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadDocumentDialog;

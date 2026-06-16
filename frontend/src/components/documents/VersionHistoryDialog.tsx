import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Typography,
  Box,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useDocumentVersions, useDownloadVersion } from '../../hooks/useDocuments';
import dayjs from 'dayjs';

interface VersionHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  documentId: string;
  documentTitle: string;
}

const VersionHistoryDialog: React.FC<VersionHistoryDialogProps> = ({
  open,
  onClose,
  documentId,
  documentTitle,
}) => {
  const { data: versions, isLoading } = useDocumentVersions(documentId);
  const downloadVersion = useDownloadVersion();

  const handleDownload = async (versionId: string) => {
    await downloadVersion.mutateAsync(versionId);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Version History — {documentTitle}</DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : versions && versions.length > 0 ? (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center" style={{ width: '80px' }}>Ver</TableCell>
                  <TableCell>Filename</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Uploaded By</TableCell>
                  <TableCell>Date Uploaded</TableCell>
                  <TableCell align="right" style={{ width: '100px' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {versions.map((version) => (
                  <TableRow key={version.id}>
                    <TableCell align="center">v{version.version_number}</TableCell>
                    <TableCell>{version.file_name}</TableCell>
                    <TableCell>{formatFileSize(version.file_size)}</TableCell>
                    <TableCell>{version.uploader_name || 'System'}</TableCell>
                    <TableCell>
                      {dayjs(version.created_at).format('MMM DD, YYYY hh:mm A')}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleDownload(version.id)}
                        disabled={downloadVersion.isPending}
                        title="Download version"
                      >
                        <DownloadIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            No versions found.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VersionHistoryDialog;

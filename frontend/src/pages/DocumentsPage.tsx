import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  History as HistoryIcon,
  Upload as UploadIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Description as DocIcon,
  FolderZip as ZipIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import DashboardLayout from '../layouts/DashboardLayout';
import { useDocuments, useDownloadVersion } from '../hooks/useDocuments';
import UploadDocumentDialog from '../components/documents/UploadDocumentDialog';
import VersionHistoryDialog from '../components/documents/VersionHistoryDialog';
import dayjs from 'dayjs';

const DocumentsPage: React.FC = () => {
  const { data: documents, isLoading } = useDocuments();
  const downloadVersion = useDownloadVersion();

  const [search, setSearch] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  
  // States for version uploading
  const [versionUploadOpen, setVersionUploadOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | undefined>(undefined);
  const [selectedDocTitle, setSelectedDocTitle] = useState<string | undefined>(undefined);

  // File size formatter
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file type icon
  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <FileIcon color="action" />;
    const type = fileType.toLowerCase();
    
    if (type.includes('pdf')) {
      return <PdfIcon sx={{ color: '#E24C3C' }} />;
    }
    if (type.includes('image/') || ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].some(ext => type.includes(ext))) {
      return <ImageIcon sx={{ color: '#2ECC71' }} />;
    }
    if (type.includes('word') || type.includes('excel') || type.includes('spreadsheet') || type.includes('text/') || ['txt', 'csv', 'doc', 'docx', 'xls', 'xlsx'].some(ext => type.includes(ext))) {
      return <DocIcon sx={{ color: '#3498DB' }} />;
    }
    if (type.includes('zip') || type.includes('compressed') || ['zip', 'rar', '7z', 'tar', 'gz'].some(ext => type.includes(ext))) {
      return <ZipIcon sx={{ color: '#9B59B6' }} />;
    }
    return <FileIcon color="action" />;
  };

  const filteredDocs = documents?.filter((doc) =>
    doc.title.toLowerCase().includes(search.toLowerCase()) ||
    doc.file_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h5" fontWeight={800}>Document Explorer</Typography>
          <Typography variant="body2" color="text.secondary">
            Securely upload, version-track, and manage files linked with your tasks.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setUploadOpen(true)}
          sx={{ background: 'linear-gradient(135deg, #0078D4 0%, #6264A7 100%)' }}
        >
          Upload Document
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Box mb={3}>
        <TextField
          placeholder="Search documents by title or file name..."
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          size="small"
        />
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : filteredDocs && filteredDocs.length > 0 ? (
        <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell style={{ width: '40px' }}></TableCell>
                <TableCell>Title / Logical Name</TableCell>
                <TableCell>Filename</TableCell>
                <TableCell align="center">Ver</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Uploader</TableCell>
                <TableCell>Linked Task</TableCell>
                <TableCell>Last Updated</TableCell>
                <TableCell align="right" style={{ width: '180px' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDocs.map((doc) => (
                <TableRow
                  key={doc.id}
                  sx={{
                    transition: 'background-color 0.2s',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <TableCell>{getFileIcon(doc.file_type)}</TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                      {doc.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {doc.file_name || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={`v${doc.version_number || 1}`}
                      size="small"
                      variant="outlined"
                      color="primary"
                      sx={{ height: 20, fontSize: '0.75rem', fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                  <TableCell>{doc.creator_name || 'System'}</TableCell>
                  <TableCell>
                    {doc.task_id ? (
                      <Chip
                        label={doc.task_title || 'Linked Task'}
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ maxWidth: 180, fontWeight: 500 }}
                      />
                    ) : (
                      <Typography variant="caption" color="text.disabled">
                        Unlinked
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {dayjs(doc.updated_at).format('MMM DD, YYYY')}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <Tooltip title="Download Latest Version">
                        <span>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => doc.version_id && downloadVersion.mutateAsync(doc.version_id)}
                            disabled={downloadVersion.isPending}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Upload New Version">
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => {
                            setSelectedDocId(doc.id);
                            setSelectedDocTitle(doc.title);
                            setVersionUploadOpen(true);
                          }}
                        >
                          <UploadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Version History">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedDocId(doc.id);
                            setSelectedDocTitle(doc.title);
                            setHistoryOpen(true);
                          }}
                        >
                          <HistoryIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No documents found
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {search ? 'No documents match your search query.' : 'Upload your first document to start tracking versions and attaching files to tasks.'}
          </Typography>
          {!search && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setUploadOpen(true)}
            >
              Upload Document
            </Button>
          )}
        </Paper>
      )}

      {/* Upload New Document Dialog */}
      <UploadDocumentDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
      />

      {/* Upload New Version Dialog */}
      {selectedDocId && (
        <UploadDocumentDialog
          open={versionUploadOpen}
          onClose={() => {
            setVersionUploadOpen(false);
            setSelectedDocId(undefined);
            setSelectedDocTitle(undefined);
          }}
          documentId={selectedDocId}
          documentTitle={selectedDocTitle}
        />
      )}

      {/* Version History Dialog */}
      {selectedDocId && (
        <VersionHistoryDialog
          open={historyOpen}
          onClose={() => {
            setHistoryOpen(false);
            setSelectedDocId(undefined);
            setSelectedDocTitle(undefined);
          }}
          documentId={selectedDocId}
          documentTitle={selectedDocTitle || ''}
        />
      )}
    </DashboardLayout>
  );
};

export default DocumentsPage;

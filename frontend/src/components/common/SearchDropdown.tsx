import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Chip,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  History as HistoryIcon,
  Close as CloseIcon,
  Assignment as TaskIcon,
  CheckCircle as ApprovalIcon,
  Group as MeetingIcon,
  FolderOpen as DocumentIcon,
  Notifications as NotificationIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  useSearch,
  getSearchHistory,
  addSearchHistoryTerm,
  clearSearchHistory,
  SearchItem,
} from '../../hooks/useSearch';
import dayjs from 'dayjs';

interface SearchDropdownProps {
  open: boolean;
  onClose: () => void;
  query: string;
  onSelectTerm: (term: string) => void;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  open,
  onClose,
  query,
  onSelectTerm,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'tasks' | 'approvals' | 'meetings' | 'documents' | 'notifications'>('all');
  const [history, setHistory] = useState<string[]>([]);

  // Fetch results based on debounced search query
  const { data: results, isLoading } = useSearch(query, activeTab);

  // Sync history on mount and when open changes
  useEffect(() => {
    if (open) {
      setHistory(getSearchHistory());
    }
  }, [open]);

  if (!open) return null;

  const handleHistoryRemove = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    try {
      const updatedHistory = history.filter(item => item !== term);
      setHistory(updatedHistory);
      const historyStr = localStorage.getItem('owh_search_history');
      if (historyStr) {
        const parsed = JSON.parse(historyStr) as string[];
        const filtered = parsed.filter(item => item.toLowerCase() !== term.toLowerCase());
        localStorage.setItem('owh_search_history', JSON.stringify(filtered));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAllHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearSearchHistory();
    setHistory([]);
  };

  const handleResultClick = (item: SearchItem) => {
    // Save query to history
    addSearchHistoryTerm(query);
    onClose();

    // Route logic
    switch (item.type) {
      case 'task':
        navigate(`/tasks?taskId=${item.id}`);
        break;
      case 'meeting':
        navigate(`/meetings?meetingId=${item.id}`);
        break;
      case 'approval':
        navigate('/approvals');
        break;
      case 'document':
        navigate('/documents');
        break;
      case 'notification':
        navigate('/dashboard'); // or redirect where appropriate
        break;
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'task':
        return <TaskIcon color="primary" />;
      case 'approval':
        return <ApprovalIcon color="success" />;
      case 'meeting':
        return <MeetingIcon color="secondary" />;
      case 'document':
        return <DocumentIcon color="info" />;
      case 'notification':
        return <NotificationIcon color="warning" />;
      default:
        return <TaskIcon />;
    }
  };

  // Compile flat results list for 'all' tab or select specific array
  const getResultsList = (): SearchItem[] => {
    if (!results) return [];
    if (activeTab === 'all') {
      return [
        ...results.tasks,
        ...results.approvals,
        ...results.meetings,
        ...results.documents,
        ...results.notifications,
      ].sort((a, b) => dayjs(b.created_at).diff(dayjs(a.created_at)));
    }
    return results[activeTab] || [];
  };

  const resultsList = getResultsList();

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        mt: 1,
        zIndex: 1300,
        maxHeight: 480,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Category Tabs */}
      <Box p={1.5} borderBottom="1px solid" borderColor="divider" bgcolor="action.hover">
        <Stack direction="row" spacing={1} overflow="auto" sx={{ '&::-webkit-scrollbar': { display: 'none' } }}>
          {(['all', 'tasks', 'approvals', 'meetings', 'documents', 'notifications'] as const).map((tab) => (
            <Chip
              key={tab}
              label={tab.toUpperCase()}
              size="small"
              clickable
              color={activeTab === tab ? 'primary' : 'default'}
              variant={activeTab === tab ? 'filled' : 'outlined'}
              onClick={() => setActiveTab(tab)}
              sx={{ fontWeight: 600, fontSize: '0.7rem' }}
            />
          ))}
        </Stack>
      </Box>

      {/* Main content scroll area */}
      <Box flex={1} overflow="auto" style={{ maxHeight: '350px' }}>
        {/* Loading Indicator */}
        {isLoading && query.trim() && (
          <Box display="flex" justifyContent="center" alignItems="center" p={4} gap={2}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Searching enterprise...
            </Typography>
          </Box>
        )}

        {/* Search History (when query is empty) */}
        {!query.trim() && (
          <Box>
            {history.length > 0 ? (
              <>
                <Box px={2} pt={1.5} pb={0.5} display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" fontWeight={700} color="text.secondary">
                    RECENT SEARCHES
                  </Typography>
                  <Button
                    size="small"
                    onClick={handleClearAllHistory}
                    sx={{ fontSize: '0.7rem', color: 'text.secondary', p: 0, minWidth: 0 }}
                  >
                    Clear all
                  </Button>
                </Box>
                <List dense>
                  {history.map((term) => (
                    <ListItem
                      key={term}
                      disablePadding
                      secondaryAction={
                        <IconButton size="small" onClick={(e) => handleHistoryRemove(e, term)}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      }
                    >
                      <ListItemButton onClick={() => onSelectTerm(term)}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <HistoryIcon fontSize="small" color="action" />
                        </ListItemIcon>
                        <ListItemText primary={term} primaryTypographyProps={{ variant: 'body2' }} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </>
            ) : (
              <Box p={3} textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  Type to search tasks, approvals, meetings, documents, and notifications.
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Results List */}
        {!isLoading && query.trim() && (
          <Box>
            {resultsList.length > 0 ? (
              <List dense>
                {resultsList.map((item) => (
                  <ListItem key={`${item.type}-${item.id}`} disablePadding>
                    <ListItemButton onClick={() => handleResultClick(item)}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {getItemIcon(item.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.title}
                        secondary={
                          <Typography variant="caption" color="text.secondary" noWrap display="block">
                            {item.description || 'No description available'}
                          </Typography>
                        }
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 600, noWrap: true }}
                      />
                      <Box display="flex" flexDirection="column" alignItems="flex-end" ml={1}>
                        <Chip
                          label={item.type.toUpperCase()}
                          size="small"
                          sx={{ height: 16, fontSize: '0.6rem', fontWeight: 700, mb: 0.5, cursor: 'pointer' }}
                        />
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
                          {dayjs(item.created_at).format('MMM DD')}
                        </Typography>
                      </Box>
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box p={4} textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  No matching results found.
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

import { Button } from '@mui/material';
export default SearchDropdown;

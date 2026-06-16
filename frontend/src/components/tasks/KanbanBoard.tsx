import React, { useMemo } from 'react';
import { Box, Typography, Paper, Avatar, Chip } from '@mui/material';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Task, useUpdateTaskStatus } from '@/hooks/useTasks';

const KANBAN_COLUMNS = [
  { id: 'draft', title: 'Draft', color: '#605E5C', bg: '#F3F2F1' },
  { id: 'assigned', title: 'Assigned', color: '#8A8886', bg: '#E1DFDD' },
  { id: 'in_progress', title: 'In Progress', color: '#0078D4', bg: '#EFF6FC' },
  { id: 'blocked', title: 'Blocked', color: '#A4262C', bg: '#FDE7E9' },
  { id: 'completed', title: 'Completed', color: '#107C10', bg: '#EFF7EF' },
];

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#A4262C',
  high: '#D83B01',
  medium: '#F7630C',
  low: '#107C10',
};

interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onTaskClick }) => {
  const updateStatus = useUpdateTaskStatus();

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    KANBAN_COLUMNS.forEach(col => {
      grouped[col.id] = [];
    });
    tasks.forEach(task => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      } else {
        // Fallback for statuses not in kanban columns (like 'todo', 'review', 'overdue')
        if (!grouped['draft']) grouped['draft'] = [];
        grouped['draft'].push(task);
      }
    });
    return grouped;
  }, [tasks]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // Dropped outside a valid droppable
    if (!destination) return;

    // Dropped in the same place
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const newStatus = destination.droppableId;
    updateStatus.mutate({ id: draggableId, status: newStatus });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2, height: 'calc(100vh - 250px)' }}>
        {KANBAN_COLUMNS.map(column => (
          <Paper
            key={column.id}
            elevation={0}
            sx={{
              minWidth: 300,
              width: 300,
              backgroundColor: column.bg,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '100%',
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            {/* Column Header */}
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight={700} color={column.color}>
                {column.title}
              </Typography>
              <Chip label={tasksByStatus[column.id]?.length || 0} size="small" sx={{ fontWeight: 700, backgroundColor: 'rgba(0,0,0,0.05)' }} />
            </Box>

            {/* Droppable Area */}
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <Box
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{
                    flex: 1,
                    p: 1.5,
                    overflowY: 'auto',
                    backgroundColor: snapshot.isDraggingOver ? 'rgba(0,0,0,0.02)' : 'transparent',
                    transition: 'background-color 0.2s',
                  }}
                >
                  {tasksByStatus[column.id]?.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <Paper
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          elevation={snapshot.isDragging ? 4 : 1}
                          onClick={() => onTaskClick(task)}
                          sx={{
                            p: 2,
                            mb: 1.5,
                            borderRadius: 2,
                            backgroundColor: 'background.paper',
                            borderLeft: '4px solid',
                            borderLeftColor: PRIORITY_COLORS[task.priority] || 'primary.main',
                            cursor: 'pointer',
                            '&:hover': {
                              boxShadow: 2,
                            },
                          }}
                        >
                          <Typography variant="subtitle2" fontWeight={700} mb={1} sx={{ wordBreak: 'break-word' }}>
                            {task.title}
                          </Typography>
                          
                          {task.email_subject && (
                            <Typography variant="caption" color="text.secondary" display="block" noWrap mb={1}>
                              📧 {task.email_subject}
                            </Typography>
                          )}

                          <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                            {task.assignee_name ? (
                              <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: 'primary.main' }}>
                                {task.assignee_name.charAt(0)}
                              </Avatar>
                            ) : (
                              <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: 'action.disabledBackground' }}>
                                ?
                              </Avatar>
                            )}
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                              {task.priority.toUpperCase()}
                            </Typography>
                          </Box>
                        </Paper>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </Paper>
        ))}
      </Box>
    </DragDropContext>
  );
};

export default KanbanBoard;

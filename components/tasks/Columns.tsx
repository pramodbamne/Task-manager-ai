'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Task, Priority, Status } from '@prisma/client';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { TaskFormDialog } from './TaskFormDialog';
import { Badge } from '@/components/ui/badge';

const priorityBadge = (priority: Priority) => {
  switch (priority) {
    case 'URGENT':
      return <Badge variant="destructive">Urgent</Badge>;
    case 'HIGH':
      return <Badge className="bg-orange-500 text-white">High</Badge>;
    case 'NORMAL':
      return <Badge variant="secondary">Normal</Badge>;
    case 'LOW':
      return <Badge variant="outline">Low</Badge>;
    default:
      return <Badge>{priority}</Badge>;
  }
};

const statusBadge = (status: Status) => {
    switch(status) {
        case 'TODO':
            return <Badge variant="secondary">To Do</Badge>;
        case 'IN_PROGRESS':
            return <Badge className="bg-blue-500 text-white">In Progress</Badge>;
        case 'DONE':
            return <Badge className="bg-green-500 text-white">Done</Badge>;
        default:
            return <Badge>{status}</Badge>;
    }
}


export const columns = (onTaskUpdate: () => void): ColumnDef<Task>[] => [
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => <div className="font-medium">{row.original.description}</div>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => statusBadge(row.original.status),
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: ({ row }) => priorityBadge(row.original.priority),
  },
  {
    accessorKey: 'deadline',
    header: 'Deadline',
    cell: ({ row }) => {
      const deadline = row.original.deadline;
      return deadline ? new Date(deadline).toLocaleDateString() : 'N/A';
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const task = row.original;

      const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this task?')) return;

        try {
          const response = await fetch(`/api/tasks/${task.id}`, {
            method: 'DELETE',
          });
          if (!response.ok) throw new Error('Failed to delete task');
          toast.success('Task deleted successfully');
          onTaskUpdate();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
      };

      return (
        <TaskFormDialog task={task} onTaskUpdate={onTaskUpdate}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(task.description)}>
                Copy Description
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {/* The TaskFormDialog will be triggered by the parent, so we just need a placeholder here */}
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TaskFormDialog>
      );
    },
  },
];
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ListChecks, Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

type TaskStatus = 'todo' | 'in_progress' | 'done';
type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  created_at: string;
  completed_at: string | null;
}

const priorityStyles: Record<TaskPriority, string> = {
  low: 'bg-muted text-muted-foreground border-border',
  medium: 'bg-primary/10 text-primary border-primary/30',
  high: 'bg-neon-amber/10 text-neon-amber border-neon-amber/30',
  critical: 'bg-destructive/10 text-destructive border-destructive/30',
};

export function TasksWidget() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) {
      toast.error('Failed to load tasks');
    } else {
      setTasks((data ?? []) as Task[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
    const channel = supabase
      .channel('tasks-widget')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchTasks();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addTask = async () => {
    const title = newTitle.trim();
    if (!title) return;
    setAdding(true);
    const { error } = await supabase.from('tasks').insert({ title });
    if (error) toast.error('Failed to add task');
    else setNewTitle('');
    setAdding(false);
  };

  const toggleDone = async (task: Task) => {
    const next: TaskStatus = task.status === 'done' ? 'todo' : 'done';
    const { error } = await supabase
      .from('tasks')
      .update({
        status: next,
        completed_at: next === 'done' ? new Date().toISOString() : null,
      })
      .eq('id', task.id);
    if (error) toast.error('Failed to update task');
  };

  const removeTask = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) toast.error('Failed to delete task');
  };

  const openCount = tasks.filter((t) => t.status !== 'done').length;

  return (
    <Card className="p-4 bg-card/50 backdrop-blur border-border h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">System Tasks</h3>
        </div>
        <Badge variant="outline" className="text-xs font-mono">
          {openCount} open
        </Badge>
      </div>

      <div className="flex gap-2 mb-3">
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          placeholder="Add a task..."
          className="h-8 text-xs"
        />
        <Button size="sm" onClick={addTask} disabled={adding || !newTitle.trim()} className="h-8">
          {adding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 -mx-2 px-2">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-8">No tasks yet</div>
        ) : (
          <ul className="space-y-1.5">
            <AnimatePresence initial={false}>
              {tasks.map((task) => (
                <motion.li
                  key={task.id}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="group flex items-start gap-2 p-2 rounded-md border border-border/50 hover:border-border hover:bg-muted/30 transition-colors"
                >
                  <Checkbox
                    checked={task.status === 'done'}
                    onCheckedChange={() => toggleDone(task)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs truncate ${
                        task.status === 'done'
                          ? 'line-through text-muted-foreground'
                          : 'text-foreground'
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge
                        variant="outline"
                        className={`text-[10px] py-0 px-1.5 h-4 ${priorityStyles[task.priority]}`}
                      >
                        {task.priority}
                      </Badge>
                      {task.status === 'in_progress' && (
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4">
                          in progress
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </ScrollArea>
    </Card>
  );
}

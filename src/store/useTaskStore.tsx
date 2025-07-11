import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import * as Notifications from "expo-notifications";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { mmkvStorage } from "./storage";
dayjs.extend(customParseFormat);

export type Task = {
  id: string;
  title: string;
  description: string;
  isPinned: boolean;
  isRepeated: boolean;
  date: string; // formatted as "DD/MM/YYYY"
  time: string; // formatted as "hh:mm A"
  repeatedFrequency: string | null;
  notificationId?: string | null;
};

type TaskState = {
  tasks: Task[];
  addTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  togglePin: (id: string) => void;
  clearAllTasks: () => void;
  clearPastTasks: () => void;
  clearFutureTasks: () => void;
};

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],

      addTask: (task) => {
        set((state) => ({
          tasks: [...state.tasks, task],
        }));
      },

      deleteTask: (id) => {
        // Cancel any scheduled notification first
        const taskToDelete = get().tasks.find((t) => t.id === id);
        if (taskToDelete?.notificationId) {
          Notifications.cancelScheduledNotificationAsync(
            taskToDelete.notificationId
          ).catch((e) => console.warn("Cancel notification failed:", e));
        }

        // Remove the task from state
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },

      togglePin: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, isPinned: !task.isPinned } : task
          ),
        }));
      },

      clearAllTasks: () => {
        // Cancel all scheduled notifications
        get().tasks.forEach((task) => {
          if (task.notificationId) {
            Notifications.cancelScheduledNotificationAsync(
              task.notificationId
            ).catch(() => {});
          }
        });
        set({ tasks: [] });
      },

      clearPastTasks: () => {
        const now = dayjs();
        const tasksToDelete: Task[] = [];
        set((state) => {
          const filtered = state.tasks.filter((task) => {
            if (task.isRepeated || task.isPinned) return true;
            const scheduled = dayjs(
              `${task.date} ${task.time}`,
              "DD/MM/YYYY hh:mm A"
            );
            const isPast = scheduled.isBefore(now);
            if (isPast) tasksToDelete.push(task);
            return !isPast;
          });
          return { tasks: filtered };
        });
        // Cancel notifications for deleted tasks
        tasksToDelete.forEach((task) => {
          if (task.notificationId) {
            Notifications.cancelScheduledNotificationAsync(
              task.notificationId
            ).catch(() => {});
          }
        });
      },

      clearFutureTasks: () => {
        const now = dayjs();
        const tasksToDelete: Task[] = [];
        set((state) => {
          const filtered = state.tasks.filter((task) => {
            if (task.isRepeated || task.isPinned) return true;
            const scheduled = dayjs(
              `${task.date} ${task.time}`,
              "DD/MM/YYYY hh:mm A"
            );
            const isFuture = scheduled.isAfter(now);
            if (isFuture) tasksToDelete.push(task);
            return !isFuture;
          });
          return { tasks: filtered };
        });
        // Cancel notifications for deleted tasks
        tasksToDelete.forEach((task) => {
          if (task.notificationId) {
            Notifications.cancelScheduledNotificationAsync(
              task.notificationId
            ).catch(() => {});
          }
        });
      },
    }),
    {
      name: "task-storage",
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);

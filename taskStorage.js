import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEY = '@tasks_list';

export const PRIORITIES = {
  alta: { label: 'Alta', color: '#FF5555' },
  media: { label: 'Media', color: '#FFB84D' },
  baja: { label: 'Baja', color: '#4CAF50' },
};

export const loadTasks = async () => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return stored !== null ? JSON.parse(stored) : [];
  } catch (e) {
    console.log('Error cargando tareas:', e);
    return [];
  }
};

export const saveTasks = async (tasks) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.log('Error guardando tareas:', e);
  }
};
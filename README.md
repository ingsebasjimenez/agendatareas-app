# 📋 AgendaTareas

Aplicación móvil de gestión de tareas construida con **React Native** y **Expo**. Permite crear tareas con nivel de prioridad y fecha límite, y visualizarlas en un calendario mensual con código de colores.

## ✨ Funcionalidades

- ✅ Crear, completar y eliminar tareas
- 🎯 Asignar prioridad (Alta / Media / Baja) a cada tarea
- 📅 Fecha límite opcional para cada tarea
- 🗓️ Vista de calendario: los días se pintan según la prioridad de las tareas pendientes
- 📊 Barra de progreso con el conteo de tareas completadas
- 💾 Persistencia local de datos con `AsyncStorage` (las tareas se guardan en el dispositivo)

## 🛠️ Tecnologías

- React Native
- Expo (SDK 54) + Expo Router
- AsyncStorage
- react-native-calendars
- @react-native-community/datetimepicker

## 🚀 Cómo ejecutarlo

```bash
git clone https://github.com/ingsebasjimenez/agendatareas-app.git
cd agendatareas-app
npm install
npx expo start
```

Escanea el código QR con la app **Expo Go** (Android/iOS) para probarlo en tu celular.

## 👤 Autor

Sebastián David Jiménez Sarmiento
[GitHub](https://github.com/ingsebasjimenez) · [LinkedIn](https://linkedin.com/in/sebastián-jiménez-sarmiento-78a46a423)
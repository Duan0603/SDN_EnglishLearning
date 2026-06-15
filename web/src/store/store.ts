// Redux Store — Architecture: Redux Toolkit with Custom Socket.io Middleware
// Architecture Rule: Custom Redux Middleware is the ONLY place that listens to Socket.io events
// This middleware will be fully implemented in Story 1.4 (Socket.io Infrastructure)
import { configureStore } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import authReducer from '../features/auth/authSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // exam: examReducer,      // Epic 2
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Socket.io instances are not serializable — ignore these paths
        ignoredActions: ['socket/connected', 'socket/disconnected'],
        ignoredPaths: ['socket.instance'],
      },
    }),
  // Socket.io middleware will be added in Story 1.4:
  // middleware: (getDefaultMiddleware) =>
  //   getDefaultMiddleware().concat(socketMiddleware),
})

// Typed hooks — use these instead of plain useDispatch/useSelector throughout the app
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

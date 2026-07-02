import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UserStories from './pages/UserStories';
import TestCases from './pages/TestCases';
import Campaigns from './pages/Campaigns';
import Execution from './pages/Execution';
import Bugs from './pages/Bugs';
import Users from './pages/Users';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="stories" element={
          <ProtectedRoute roles={['admin', 'qa_engineer', 'test_manager']}>
            <UserStories />
          </ProtectedRoute>
        } />
        <Route path="testcases" element={
          <ProtectedRoute roles={['admin', 'qa_engineer', 'test_manager']}>
            <TestCases />
          </ProtectedRoute>
        } />
        <Route path="campaigns" element={
          <ProtectedRoute roles={['admin', 'qa_engineer', 'test_manager']}>
            <Campaigns />
          </ProtectedRoute>
        } />
        <Route path="execution" element={
          <ProtectedRoute roles={['admin', 'qa_engineer']}>
            <Execution />
          </ProtectedRoute>
        } />
        <Route path="bugs" element={<Bugs />} />
        <Route path="users" element={
          <ProtectedRoute roles={['admin']}>
            <Users />
          </ProtectedRoute>
        } />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;

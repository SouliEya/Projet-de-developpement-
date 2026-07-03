import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UserStories from './pages/UserStories';
import StoryTestCases from './pages/StoryTestCases';
import StoryBugs from './pages/StoryBugs';
import BacklogUnified from './pages/BacklogUnified';
import Sprints from './pages/Sprints';
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
          <ProtectedRoute roles={['admin', 'qa_engineer', 'test_manager', 'product_owner']}>
            <UserStories />
          </ProtectedRoute>
        } />
        <Route path="stories/:id/tests" element={
          <ProtectedRoute roles={['admin', 'qa_engineer', 'test_manager']}>
            <StoryTestCases />
          </ProtectedRoute>
        } />
        <Route path="stories/:id/bugs" element={
          <ProtectedRoute roles={['admin', 'qa_engineer', 'test_manager', 'developer', 'product_owner']}>
            <StoryBugs />
          </ProtectedRoute>
        } />
        <Route path="backlog" element={
          <ProtectedRoute roles={['admin', 'qa_engineer', 'test_manager', 'product_owner']}>
            <BacklogUnified />
          </ProtectedRoute>
        } />
        <Route path="sprints" element={
          <ProtectedRoute roles={['admin', 'qa_engineer', 'test_manager', 'product_owner']}>
            <Sprints />
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

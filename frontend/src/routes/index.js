// src/routes/index.js
import { ProtectedRoute } from './protectedRoute';
import { Navigate, Outlet } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ForumsDashboard from '@/pages/Forum/ForumDashboard';
import ForumPage from '@/pages/Forum/ForumPage';
import SearchResults from '@/pages/SearchResults';
import CreateForumPage from '@/pages/Forum/CreateForumPage';
import MessagesPage from '@/pages/Messages/MessagesPage';
export const routes = [
    {
        path: '/',
        element: (
            <ProtectedRoute>
                <Layout><Outlet /></Layout>
            </ProtectedRoute>
        ),
        children: [
            {
                path: '',
                element: <Navigate to="dashboard" replace />
            },
            {
                path: 'dashboard',
                element: <ForumsDashboard />
            },
            {
                path: 'forums/:forumId',
                element: <ForumPage />
            },
            {
                path: 'forums/create',
                element: <CreateForumPage />
            },
            {
                path: 'messages',
                element: <MessagesPage />
            },
            // // Users routes
            // {
            //     path: 'me',
            //     element: <Outlet />,
            //     children: [
            //         {
            //             path: '/edit',
            //             element: <UserDetails />
            //         }
            //     ]
            // }
            {
                path: 'search',
                element: <SearchResults />
            }
        ]
    }
];
import './index.css';
import Login from './pages/Auth/Login';
import { routes } from './routes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const queryClient = new QueryClient();

function App() {
    const renderRoutes = (routes) => {
        return routes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element}>
                {route.children &&
                    route.children.map((childRoute) => (
                        <Route
                            key={childRoute.path || 'index'}
                            index={childRoute.index}
                            path={childRoute.path}
                            element={childRoute.element}
                        >
                            {childRoute.children && renderRoutes(childRoute.children)}
                        </Route>
                    ))}
            </Route>
        ));
    };

    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    {renderRoutes(routes)}
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;

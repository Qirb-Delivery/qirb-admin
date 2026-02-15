import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Drivers from './pages/Drivers';
import Orders from './pages/Orders';
import Users from './pages/Users';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Promos from './pages/Promos';
import DeliveryZones from './pages/DeliveryZones';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('admin_token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/drivers" element={<Drivers />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/users" element={<Users />} />
                <Route path="/products" element={<Products />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/promos" element={<Promos />} />
                <Route path="/zones" element={<DeliveryZones />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

export default function LayoutPrincipal() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: '#f8fafc', padding: 24 }}>
        <Outlet />
      </main>
    </>
  );
}

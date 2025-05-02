// Importa le dipendenze
import './App.css';
import { AuthProvider, useAuth } from './utlis/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminRoute from "./component/admin/routing/AdminRoute.jsx";
// import pagine e componenti
import Header from './component/headers/header';
import HeaderAdmin from './component/headers/headerAdmin.jsx';
import HomePage from './pages/pubblic/home.jsx';
import LoginPage from './pages/pubblic/login.jsx';
import RegisterPage from './pages/pubblic/register.jsx';
import AdminHome from './pages/admin/adminHome.jsx';
import ManageCPUs from './pages/admin/manageCPUs.jsx';
import ManageCases from './pages/admin/manageCases.jsx';
import ManageCoolers from './pages/admin/manageCoolers.jsx';
import ManageGPUs from './pages/admin/manageGPUs.jsx';
import ManageMotherboards from './pages/admin/manageMotherboards.jsx';
import ManagePowers from './pages/admin/managePowers.jsx';
import ManageRAMs from './pages/admin/manageRAMs.jsx';
import ManageStorage from './pages/admin/manageStorage.jsx';
import ManageGaming from './pages/admin/manageGaming.jsx';
import ManageWorkstation from './pages/admin/manageWorkstation.jsx';
import IntelConfigurator from './pages/pubblic/IntelConfigurator.jsx';
import MachineDetailPage from './pages/pubblic/machineDetails.jsx';
import CheckoutPage from './pages/pubblic/checkout/CheckoutPage.jsx';
import AmdConfigurator from './pages/pubblic/amdConfigurator.jsx';
import PreBuildGaming from './pages/pubblic/preBuildGaming.jsx';
import PrebuiltDetail from './pages/pubblic/PrebuiltDetail.jsx';
import WorkStation from './pages/pubblic/workStation.jsx';
import AboutPage from './pages/pubblic/about.jsx';
import ContactPage from './utlis/contactForm.jsx';
import ConfigSelection from './pages/pubblic/configintamd.jsx';
import PreconfigSelection from './pages/pubblic/preconfigintamd.jsx';
import Profile from './pages/pubblic/profile.jsx';
import MyConfiguration from './pages/pubblic/myconfiguration.jsx';
import ResetPassword from "./pages/pubblic/ResetPassword";
import ForgotPassword from "./pages/pubblic/ForgotPassword";
import OrderConfirmation from './pages/pubblic/OrderConfirmation';
import AdminGestUser from './pages/admin/adminGestUser.jsx';
import PrintableOrderPage from './pages/PrintableOrderPage.jsx';
import Footer from './component/footer/footer.jsx';
// Componente smart layout che mostra l'header appropriato in base al ruolo dell'utente
const SmartLayout = ({ children }) => {
  const { userData, isAuthenticated, isAdmin } = useAuth();

  console.log("SmartLayout - isAuthenticated:", isAuthenticated);
  console.log("SmartLayout - userData:", userData);
  console.log("SmartLayout - isAdmin:", isAdmin);

  // Usa direttamente isAdmin dal contesto, o verificalo manualmente
  const userIsAdmin = isAdmin || (isAuthenticated && userData && userData.role === 'admin');

  return (
    <>
      {userIsAdmin ? <HeaderAdmin /> : <Header />}
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>

        <Routes>
          {/* Rotte pubbliche con Header intelligente basato sul ruolo */}
          <Route path="/" element={<SmartLayout><HomePage /></SmartLayout>} />
          <Route path="/login" element={<SmartLayout><LoginPage /></SmartLayout>} />
          <Route path="/register" element={<SmartLayout><RegisterPage /></SmartLayout>} />
          <Route path="/reset-password/:token" element={<SmartLayout><ResetPassword /></SmartLayout>} />
          <Route path="/reset-password" element={<SmartLayout><ResetPassword /></SmartLayout>} />
          <Route path="/forgot-password" element={<SmartLayout><ForgotPassword /></SmartLayout>} />
          <Route path="/orders/:id/confirmation" element={<SmartLayout><OrderConfirmation /></SmartLayout>} />
          <Route path="/configure/intel" element={<SmartLayout><IntelConfigurator /></SmartLayout>} />
          <Route path="/configure/amd" element={<SmartLayout><AmdConfigurator /></SmartLayout>} />
          <Route path="/about" element={<SmartLayout><AboutPage /></SmartLayout>} />
          <Route path="/profile" element={<SmartLayout><Profile /></SmartLayout>} />
          <Route path="/profile/machines/:id" element={<SmartLayout><MachineDetailPage /></SmartLayout>} />
          <Route path="/checkout" element={<SmartLayout><CheckoutPage /></SmartLayout>} />
          <Route path="/prebuilt" element={<SmartLayout><PreBuildGaming /></SmartLayout>} />
          <Route path="/prebuilt/:id" element={<SmartLayout><PrebuiltDetail /></SmartLayout>} />
          <Route path="/workstation" element={<SmartLayout><WorkStation /></SmartLayout>} />
          <Route path="/contact" element={<SmartLayout><ContactPage /></SmartLayout>} />
          <Route path="/configintamd" element={<SmartLayout><ConfigSelection /></SmartLayout>} />
          <Route path="/preconfigintamd" element={<SmartLayout><PreconfigSelection /></SmartLayout>} />
          <Route path="/myconfiguration" element={<SmartLayout><MyConfiguration /></SmartLayout>} />
          <Route path="/print/order/:orderId" element={<PrintableOrderPage />} />
          {/* Rotte admin protette - usano sempre HeaderAdmin indirettamente tramite SmartLayout */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<SmartLayout><AdminHome /></SmartLayout>} />
            <Route path="/admin/manage-cpus" element={<SmartLayout><ManageCPUs /></SmartLayout>} />
            <Route path="/admin/manage-cases" element={<SmartLayout><ManageCases /></SmartLayout>} />
            <Route path="/admin/manage-coolers" element={<SmartLayout><ManageCoolers /></SmartLayout>} />
            <Route path="/admin/manage-gpus" element={<SmartLayout><ManageGPUs /></SmartLayout>} />
            <Route path="/admin/manage-motherboards" element={<SmartLayout><ManageMotherboards /></SmartLayout>} />
            <Route path="/admin/manage-powers" element={<SmartLayout><ManagePowers /></SmartLayout>} />
            <Route path="/admin/manage-rams" element={<SmartLayout><ManageRAMs /></SmartLayout>} />
            <Route path="/admin/manage-storages" element={<SmartLayout><ManageStorage /></SmartLayout>} />
            <Route path="/admin/manage-gaming-presets" element={<SmartLayout><ManageGaming /></SmartLayout>} />
            <Route path="/admin/manage-workstations" element={<SmartLayout><ManageWorkstation /></SmartLayout>} />
            <Route path="/admin/manage-users" element={<SmartLayout><AdminGestUser /></SmartLayout>} />

          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

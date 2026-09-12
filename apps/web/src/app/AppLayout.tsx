import MainContent from "../components/MainContent";
import Sidebar from "../components/Sidebar";

const AppLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />
      <MainContent />
    </div>
  );
};

export default AppLayout;
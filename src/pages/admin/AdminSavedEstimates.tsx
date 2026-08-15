import SavedEstimates from "@/components/dashboard/SavedEstimates";
import { useAuth } from "@/contexts/AuthContext";

const AdminSavedEstimates = () => {
  const { user } = useAuth();
  return <SavedEstimates role="admin" userName={user?.name || "Админ"} />;
};
export default AdminSavedEstimates;

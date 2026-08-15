import SavedEstimates from "@/components/dashboard/SavedEstimates";
import { useAuth } from "@/contexts/AuthContext";

const ManagerSavedEstimates = () => {
  const { user } = useAuth();
  return <SavedEstimates role="manager" userName={user?.name || "Менеджер"} />;
};
export default ManagerSavedEstimates;

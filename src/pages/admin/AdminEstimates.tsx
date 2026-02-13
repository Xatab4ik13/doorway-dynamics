import EstimateCalculator from "@/components/dashboard/EstimateCalculator";
import { useAuth } from "@/contexts/AuthContext";

const AdminEstimates = () => {
  const { user } = useAuth();
  return <EstimateCalculator role="admin" userName={user?.name || "Админ"} />;
};
export default AdminEstimates;

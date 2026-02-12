import EstimateCalculator from "@/components/dashboard/EstimateCalculator";
import { useAuth } from "@/contexts/AuthContext";

const ManagerEstimates = () => {
  const { user } = useAuth();
  return <EstimateCalculator role="manager" userName={user?.name || "Менеджер"} />;
};
export default ManagerEstimates;

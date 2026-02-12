import EstimateCalculator from "@/components/dashboard/EstimateCalculator";
import { useAuth } from "@/contexts/AuthContext";

const InstallerEstimates = () => {
  const { user } = useAuth();
  return <EstimateCalculator role="installer" userName={user?.name || "Монтажник"} />;
};
export default InstallerEstimates;

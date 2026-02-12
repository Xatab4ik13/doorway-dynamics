import EstimateCalculator from "@/components/dashboard/EstimateCalculator";
import { useAuth } from "@/contexts/AuthContext";

const MeasurerEstimates = () => {
  const { user } = useAuth();
  return <EstimateCalculator role="measurer" userName={user?.name || "Замерщик"} />;
};
export default MeasurerEstimates;

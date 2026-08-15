import SavedEstimates from "@/components/dashboard/SavedEstimates";
import { useAuth } from "@/contexts/AuthContext";

const InstallerSavedEstimates = () => {
  const { user } = useAuth();
  return <SavedEstimates role="installer" userName={user?.name || "Монтажник"} />;
};
export default InstallerSavedEstimates;

import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import InstallationCalendar from "@/components/dashboard/InstallationCalendar";
import CityToggle, { type CityFilter } from "@/components/dashboard/CityToggle";

const AdminCalendar = () => {
  const [city, setCity] = useState<CityFilter>("Москва");

  return (
    <DashboardLayout role="admin">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <CityToggle value={city} onChange={setCity} />
        </div>
        <InstallationCalendar cityFilter={city} />
      </div>
    </DashboardLayout>
  );
};

export default AdminCalendar;

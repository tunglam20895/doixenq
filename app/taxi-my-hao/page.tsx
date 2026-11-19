import TaxiAreaPage, { taxiAreaMetadata } from "@/components/TaxiAreaPage";
import { taxiAreas } from "@/lib/taxi-areas";
const area = taxiAreas[2];
export const metadata = taxiAreaMetadata(area);
export default function Page() {
  return <TaxiAreaPage area={area} />;
}

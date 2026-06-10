import { AddressesManager } from "@/components/account/addresses-manager";
import { getUserAddresses } from "@/modules/account/queries";
import { getCurrentUser } from "@/modules/auth/actions";

export default async function AddressesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const addresses = await getUserAddresses(user.id);

  return <AddressesManager addresses={addresses} />;
}
